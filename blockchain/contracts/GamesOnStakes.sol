pragma solidity ^0.5.0;

 ///@title fun.fair _Consensys-bootcamp-final-project
 ///@author Sachin Mittal
 ///@notice Contract is built following the smart contract design pattern
 ///@dev StringSupport library is used for salted hash (commitment scheme)

 import "./StringSupport.sol";

contract GamesOnStakes {

///@title Contract properties - Monolithic, experimental, efficient (Use of library)
///@dev For any queries, generate an issue, or email at " "


/** SIMPLE USE CASE

Sachin opens a game, bets 0.01 ether and appears in a list of users who are up to play
Sanchay sees Sachin on the list and accepts the game by betting 0.01 ether too
Sachin confirms and the game starts
Sachin and Sanchay make their moves, one after each other
If one of them wins, he or she can withdraw 0.02 ether from the contract
If the game ends in draw, both users can withdraw 0.01 ether
*/


/// STATE VARIABLES 

// The Game Object

struct Game 
  {    
    uint32 index;            // position in openGames[] list
    uint8[9] cells;          

    uint8 status;                   
    uint amount;                       

    address[2] players;                 // Player's array
    string[2] nicks;                    // Player's name Array
    uint lastTransaction;               //timestamp => Block Number
    bool[2] withdrawn;                  // If the money, is withdrawn or not

    bytes32 creatorHash;                // The hash of player who created the game  
    uint8 guestRandomNumber;            // The random number provided by the guest player for deciding who will play first
  }

    uint32[] openGames;                    // list of active games' id's
    mapping(uint32 => Game) gamesData;     // To access the details of the game

    uint32 nextGameIdx;                    // Pointer to help parse, and check conditions  
    uint16 public timeout;                  // Game Timeout

    // Pause
    bool public contractPaused = false;
    ///@notice Owner's address
    address public owner;                    //owner of the contract


     modifier onlyOwner(){
    require(owner == msg.sender,"Owner's permission is required");
    _;
  }

    modifier checkIfPaused() {
    require(contractPaused == false," Contract is paused right now ");
    _;
  }


    // @notice By default, after 10 minutes, timeout will occur
    // @dev Value provided in the ./migrations/2_deploy_contract.js 
    // @param Game timeout 
    constructor(uint16 givenTimeout) public {
      if(givenTimeout!= 0){
          timeout = givenTimeout;    
      }
      else{
        timeout = 10 minutes;
      }
    }

    // EVENTS

    event GameCreated(uint32 indexed gameIdx);
    event GameAccepted(uint32 indexed gameIdx, address indexed opponent);
    event GameStarted(uint32 indexed gameIdx, address indexed opponent);
    event PositionMarked(uint32 indexed gameIdx, address indexed opponent);
    event GameEnded(uint32 indexed gameIdx, address indexed opponent);


    // Member Functions

    //Callable 

    
    function getOpenGames() 
    public 
    view 
    returns (uint32[] memory){
      return openGames;
    }

    // Game Info - Name of the players, status of the game, 
    function getGameInfo(uint32 gameIdx)
    public
    view 
    returns (uint8[9] memory cells, uint8 status, uint amount, string memory nick1, string memory nick2) {
        return (

        gamesData[gameIdx].cells,
        gamesData[gameIdx].status,
        gamesData[gameIdx].amount,
        gamesData[gameIdx].nicks[0],
        gamesData[gameIdx].nicks[1]
        );
    }

    function getGameTimestamp(uint32 gameIdx) 
    public 
    view 
  returns (uint lastTransaction) {
      return (gamesData[gameIdx].lastTransaction);
  }

    function getGamePlayers(uint32 gameIdx) 
    public 
    view 
    returns (address player1, address player2) {
        return (
            gamesData[gameIdx].players[0],
            gamesData[gameIdx].players[1]
        );
    }

    function getGameWithdrawals(uint32 gameIdx) public view 
    returns (bool player1, bool player2) {
        return (
            gamesData[gameIdx].withdrawn[0],
            gamesData[gameIdx].withdrawn[1]
        );
    }

    // Operations

   function createGame(bytes32 randomNumberHash, string memory nick) 
   public 
   payable 
   returns (uint32 gameIdx) {
     require(nextGameIdx+1 > nextGameIdx);

      gamesData[nextGameIdx].index = uint32(openGames.length);
      gamesData[nextGameIdx].creatorHash = randomNumberHash;
      gamesData[nextGameIdx].amount = msg.value;
      gamesData[nextGameIdx].nicks[0] = nick;
      gamesData[nextGameIdx].players[0] = msg.sender;
      gamesData[nextGameIdx].lastTransaction = now;

      openGames.push(nextGameIdx);

      gameIdx = nextGameIdx;
      emit GameCreated(nextGameIdx);

      nextGameIdx++;
  }


    function acceptGame(uint32 gameIdx, uint8 randomNumber, string memory nick) 
    public 
    payable {
    
    require(gameIdx < nextGameIdx);
    require(gamesData[gameIdx].players[0] != address(0x0));
    require(msg.value == gamesData[gameIdx].amount);
    require(gamesData[gameIdx].players[1] == address(0x0));
    require(gamesData[gameIdx].status == 0);

    gamesData[gameIdx].guestRandomNumber = randomNumber;
    gamesData[gameIdx].nicks[1] = nick;
    gamesData[gameIdx].players[1] = msg.sender;
    gamesData[gameIdx].lastTransaction = now;

    emit GameAccepted(gameIdx, gamesData[gameIdx].players[0]);

    // Remove Accepted game from the openGames list
    uint32 idxToDelete = uint32(gamesData[gameIdx].index);
        uint32 lastOpenGameIdx = openGames[openGames.length - 1];
        openGames[idxToDelete] = lastOpenGameIdx;
        gamesData[lastOpenGameIdx].index = idxToDelete;
        openGames.length--;

    }

    function confirmGame(uint32 gameIdx, uint8 revealedRandomNumber, string memory revealedSalt) public {
        require(gameIdx < nextGameIdx);
        require(gamesData[gameIdx].players[0] == msg.sender);
        require(gamesData[gameIdx].players[1] != address(0x0));
        require(gamesData[gameIdx].status == 0);

      
        bytes32 computedHash = saltedHash(revealedRandomNumber, revealedSalt);
        if(computedHash != gamesData[gameIdx].creatorHash){
            gamesData[gameIdx].status = 12;
            emit GameEnded(gameIdx, msg.sender);
            emit GameEnded(gameIdx, gamesData[gameIdx].players[1]);
            return;
        }

        gamesData[gameIdx].lastTransaction = now;

        // Logic for deciding turns, if even-even/odd-odd, game creator will have the first chance
        // If odd-even, guest will have the first chance - ||Define starting player||
        if((revealedRandomNumber ^ gamesData[gameIdx].guestRandomNumber) & 0x01 == 0){
            gamesData[gameIdx].status = 1;
            emit GameStarted(gameIdx, gamesData[gameIdx].players[1]);
        }
        else {
            gamesData[gameIdx].status = 2;
            emit GameStarted(gameIdx, gamesData[gameIdx].players[1]);
        }
    }


    function markPosition(uint32 gameIdx, uint8 cell) public {

        require(gameIdx < nextGameIdx);
        require(cell<=8, "The parameter must contain a value less than max cell value limit");

        uint8[9] storage cells = gamesData[gameIdx].cells;
        require(cells[cell] == 0, "No Player has started yet");

        if(gamesData[gameIdx].status == 1){
          require(gamesData[gameIdx].players[0] == msg.sender, "Position marked! Game creator is the player 1");
          
          cells[cell] = 1;
          emit PositionMarked(gameIdx, gamesData[gameIdx].players[1]);
        }

        else if(gamesData[gameIdx].status == 2){
          require(gamesData[gameIdx].players[1] == msg.sender, "Position marked! Guest is the player 1");
          
          cells[cell] = 2;
          emit PositionMarked(gameIdx, gamesData[gameIdx].players[0]);
        }
        else{
          revert();
        }

        gamesData[gameIdx].lastTransaction = now;

        // Board indexes:
        //    0 1 2
        //    3 4 5
        //    6 7 8

        // Detect a winner:
        // Winning probability in all rows, and columns

        if((cells[0] & cells [1] & cells [2] != 0x0) || (cells[3] & cells [4] & cells [5] != 0x0) ||
        (cells[6] & cells [7] & cells [8] != 0x0) || (cells[0] & cells [3] & cells [6] != 0x0) ||
        (cells[1] & cells [4] & cells [7] != 0x0) || (cells[2] & cells [5] & cells [8] != 0x0) ||
        (cells[0] & cells [4] & cells [8] != 0x0) || (cells[2] & cells [4] & cells [6] != 0x0)) {
            // winner
            gamesData[gameIdx].status = 10 + cells[cell];  // 11 or 12
            emit GameEnded(gameIdx, gamesData[gameIdx].players[0]);
            emit GameEnded(gameIdx, gamesData[gameIdx].players[1]);
        }

        // All cells filled..! Hence, a draw
        else if(cells[0] != 0x0 && cells[1] != 0x0 && cells[2] != 0x0 && 
            cells[3] != 0x0 && cells[4] != 0x0 && cells[5] != 0x0 && cells[6] != 0x0 && 
            cells[7] != 0x0 && cells[8] != 0x0) {
            
            gamesData[gameIdx].status = 10;
            emit GameEnded(gameIdx, gamesData[gameIdx].players[0]);
            emit GameEnded(gameIdx, gamesData[gameIdx].players[1]);
        }
        else {
            if(cells[cell] == 1){
                gamesData[gameIdx].status = 2;
            }
            else if(cells[cell] == 2){
                gamesData[gameIdx].status = 1;
            }
            else{
              revert();
            }
        }
    }    
    

    function withdraw(uint32 gameIdx) public {
      require(gameIdx < nextGameIdx);
      require(gamesData[gameIdx].amount > 0, "The bet amount can not be 0");

      uint8 status = gamesData[gameIdx].status;

      // Since status = 0, consider it ends in a draw
      if(status == 0) {
      require((now - gamesData[gameIdx].lastTransaction) > timeout);

          // Player 1 cancels the non-accepted game
          if(gamesData[gameIdx].players[0] == msg.sender) {
            // checking !withdrawn[0], status would not be 0
            require(gamesData[gameIdx].players[1] == address(0x0));

            gamesData[gameIdx].withdrawn[0] = true;
            gamesData[gameIdx].status = 10; // consider it ended in draw
            msg.sender.transfer(gamesData[gameIdx].amount);
            
            // The game was open
            // Remove from the open games list
            uint32 openListIdxToDelete = uint32(gamesData[gameIdx].index);
            openGames[openListIdxToDelete] = openGames[openGames.length - 1];
            gamesData[gameIdx].index = openListIdxToDelete;
            openGames.length--;

            emit GameEnded(gameIdx, msg.sender);
          }
          // Player 2 claims the non-confirmed game
          else if(gamesData[gameIdx].players[1] == msg.sender) {
              // checking !withdrawn[1] is redundant, status would not be 0

              gamesData[gameIdx].withdrawn[1] = true;
              gamesData[gameIdx].status = 12; // consider it won by P2
              msg.sender.transfer(gamesData[gameIdx].amount * 2);
          
              // The game was not open: no need to clean it
              // from the openGames[] list

              emit GameEnded(gameIdx, msg.sender);
          }
          else {
              revert();
          }
      }
      else if(status == 1){
        // Player2 won the game  
        require(gamesData[gameIdx].players[1] == msg.sender);
        require(now - gamesData[gameIdx].lastTransaction > timeout, "Game is still alive" );

        gamesData[gameIdx].withdrawn[1] = true;
        gamesData[gameIdx].status = 12;
        msg.sender.transfer(gamesData[gameIdx].amount * 2);

        emit GameEnded(gameIdx, gamesData[gameIdx].players[0]);
      }
      else if(status == 2){
        // Player1 won the game
        require(gamesData[gameIdx].players[0] == msg.sender);
        require(now - gamesData[gameIdx].lastTransaction > timeout, "Game is still alive" );

        gamesData[gameIdx].withdrawn[0] = true;
        gamesData[gameIdx].status = 11;
        msg.sender.transfer(gamesData[gameIdx].amount * 2);

        emit GameEnded(gameIdx, gamesData[gameIdx].players[1]);
      }
      else if(status == 10){
            if(gamesData[gameIdx].players[0] == msg.sender){
                require(!gamesData[gameIdx].withdrawn[0]);

                gamesData[gameIdx].withdrawn[0] = true;
                msg.sender.transfer(gamesData[gameIdx].amount);
            }
            else if(gamesData[gameIdx].players[1] == msg.sender){
          require(!gamesData[gameIdx].withdrawn[1]);

          gamesData[gameIdx].withdrawn[1] = true;
          msg.sender.transfer(gamesData[gameIdx].amount);
           }
           else{
             revert();
           }
      }
      else if(status == 11){
          require(gamesData[gameIdx].players[0] == msg.sender);
          require(!gamesData[gameIdx].withdrawn[0]);

          gamesData[gameIdx].withdrawn[0] = true;
          msg.sender.transfer(gamesData[gameIdx].amount * 2);
      }
      else if(status == 12){
          require(gamesData[gameIdx].players[1] == msg.sender);
          require(!gamesData[gameIdx].withdrawn[1]);

          gamesData[gameIdx].withdrawn[1] = true;
          msg.sender.transfer(gamesData[gameIdx].amount * 2);
      }
      else {
          revert();
      }
    }

   // The contract owner can pause all functionality
    function circuitBreaker() public
    onlyOwner
    checkIfPaused{
    contractPaused = true;
    }
    function circuitMaker() public
    onlyOwner{
      contractPaused = false;
    }


    // Imported from library - public helper function
    function saltedHash(uint8 randomNumber, string memory salt) public pure returns (bytes32) {
        return StringSupport.saltedHash(randomNumber, salt);
    }

    // Fallback function

    function () external payable {
        revert();
    }

}









