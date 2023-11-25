// test/TestGamesOnStakes1.sol
pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/GamesOnStakes.sol";
import "../contracts/StringSupport.sol";

contract TestGamesOnStakes1 {
    GamesOnStakes gamesInstance;

    constructor() public {
        gamesInstance = GamesOnStakes(DeployedAddresses.GamesOnStakes());
    }

    function testInitiallyEmpty() public {
        Assert.equal(gamesInstance.getOpenGames().length, 0, "The games array should be empty at the begining");
    }

    function testHashingFunction() public {
        bytes32 hash1 = gamesInstance.saltedHash(123, "my salt goes here");
        bytes32 hashA = StringSupport.saltedHash(123, "my salt goes here");

        bytes32 hash2 = gamesInstance.saltedHash(123, "my salt goes 2 here");
        bytes32 hashB = StringSupport.saltedHash(123, "my salt goes 2 here");

        bytes32 hash3 = gamesInstance.saltedHash(234, "my salt goes here");
        bytes32 hashC = StringSupport.saltedHash(234, "my salt goes here");

        Assert.isNotZero(hash1, "Salted hash should be a valid string");

        Assert.equal(hash1, hashA, "Hashes should match");
        Assert.equal(hash2, hashB, "Hashes should match");
        Assert.equal(hash3, hashC, "Hashes should match");

        Assert.notEqual(hash1, hash2, "Different salt should produce different hashes");
        Assert.notEqual(hash1, hash3, "Different numbers should produce different hashes");
        Assert.notEqual(hash2, hash3, "Different numbers and salt should produce different hashes");
    }

    /* SPECS

    *We will need to emit events with the new game’s ID so that the client can retrieve 
    the value.
    *The user’s address should be set as the creator
    *The creator has to commit to a random number by providing a salted hash of it
    *The board should be empty
    *If any money was sent, it has to be registered
    */
    function testGameCreation() public {
        uint8[9] memory cells;
        uint8 status;
        uint amount;
        string memory nick1;
        string memory nick2;
        uint lastTransaction;

        bytes32 hash = gamesInstance.saltedHash(123, "my salt goes here");
        uint32 gameIdx = gamesInstance.createGame(hash, "Sachin");
        
        Assert.equal(uint(gameIdx), 0, "The first game should have index 0");
        
        uint32[] memory openGames = gamesInstance.getOpenGames();
  
        Assert.equal(openGames.length, 1, "One game should have been created");
        Assert.equal(uint(openGames[0]), 0, "The first game should have index 0");
        

        (cells, status, amount, nick1, nick2) = gamesInstance.getGameInfo(gameIdx);
        Assert.equal(uint(cells[0]), 0, "The board should be empty");
        Assert.equal(uint(cells[1]), 0, "The board should be empty");
        Assert.equal(uint(cells[2]), 0, "The board should be empty");
        Assert.equal(uint(cells[3]), 0, "The board should be empty");
        Assert.equal(uint(cells[4]), 0, "The board should be empty");
        Assert.equal(uint(cells[5]), 0, "The board should be empty");
        Assert.equal(uint(cells[6]), 0, "The board should be empty");
        Assert.equal(uint(cells[7]), 0, "The board should be empty");
        Assert.equal(uint(cells[8]), 0, "The board should be empty");
        Assert.equal(uint(status), 0, "The game should not be started");
        Assert.equal(amount, 0, "The initial amount should be zero");
    
        Assert.equal(nick1, "Sachin", "The nick should be Sachin");
        Assert.isEmpty(nick2, "Sanchay should be empty");

        lastTransaction = gamesInstance.getGameTimestamp(gameIdx);
        Assert.isAbove(lastTransaction, 0, "The first player's transaction timestamp should be set");
    }

    /* SPECS

    *The game must be created, accepted and not yet started
    *The creator has to reveal his/her random number and the salt
    *Only the creator can confirm a game
    *Player 1 should start if the last bit of both random numbers is equal; 
     player 2 should start otherwise
    *The creator’s last timestamp has to be updated

    */
    
    function testGameAccepted() public{

        uint8[9] memory cells;
        uint8 status;
        uint amount;
        string memory nick1;
        string memory nick2;
        uint lastTransaction;

        uint32[] memory openGames = gamesInstance.getOpenGames();
        Assert.equal(openGames.length, 1, "One game should be available");

        uint32 gameIdx = openGames[0];

        gamesInstance.acceptGame(gameIdx, 234, "Sanchay");

        openGames = gamesInstance.getOpenGames();

        Assert.equal(openGames.length, 0, "The game should not be available anymore");

        (cells, status, amount, nick1, nick2) = gamesInstance.getGameInfo(gameIdx);
        Assert.equal(uint(cells[0]), 0, "The board should be empty");
        Assert.equal(uint(cells[1]), 0, "The board should be empty");
        Assert.equal(uint(cells[2]), 0, "The board should be empty");
        Assert.equal(uint(cells[3]), 0, "The board should be empty");
        Assert.equal(uint(cells[4]), 0, "The board should be empty");
        Assert.equal(uint(cells[5]), 0, "The board should be empty");
        Assert.equal(uint(cells[6]), 0, "The board should be empty");
        Assert.equal(uint(cells[7]), 0, "The board should be empty");
        Assert.equal(uint(cells[8]), 0, "The board should be empty");
        Assert.equal(uint(status), 0, "The game should not be started");
        Assert.equal(amount, 0, "The initial amount should be zero");
        Assert.equal(nick1, "Sachin", "The nick should be Sachin");
        Assert.equal(nick2, "Sanchay", "The nick should be Sanchay");

        lastTransaction = gamesInstance.getGameTimestamp(gameIdx);
        Assert.isAbove(lastTransaction, 0, "The first player's transaction timestamp should be set");
    }
   
}


