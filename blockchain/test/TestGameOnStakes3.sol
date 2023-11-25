// test/TestGamesOnStakes3.sol
pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/GamesOnStakes.sol";
import "../contracts/StringSupport.sol";

contract TestGamesOnStakes3 {
    GamesOnStakes gamesInstance;

    constructor() public {
        gamesInstance = GamesOnStakes(DeployedAddresses.GamesOnStakes());
    }

    function testGameActions() public {
        uint8[9] memory cells;
        uint8 status;
        uint amount;
        string memory nick1;
        string memory nick2;

        bytes32 hash = gamesInstance.saltedHash(123, "my salt goes here");
        uint32 gameIdx = gamesInstance.createGame(hash, "Sachin");
        gamesInstance.acceptGame(gameIdx, 234, "Sanchay");
        gamesInstance.confirmGame(gameIdx, 123, "my salt goes here");

        // player 2
        gamesInstance.markPosition(gameIdx, 0);

        (cells, status, amount, nick1, nick2) = gamesInstance.getGameInfo(gameIdx);
        Assert.equal(uint(cells[0]), 2, "The board should be 2");
        Assert.equal(uint(cells[1]), 0, "The board should be empty");
        Assert.equal(uint(cells[2]), 0, "The board should be empty");
        Assert.equal(uint(cells[3]), 0, "The board should be empty");
        Assert.equal(uint(cells[4]), 0, "The board should be empty");
        Assert.equal(uint(cells[5]), 0, "The board should be empty");
        Assert.equal(uint(cells[6]), 0, "The board should be empty");
        Assert.equal(uint(cells[7]), 0, "The board should be empty");
        Assert.equal(uint(cells[8]), 0, "The board should be empty");
        Assert.equal(uint(status), 1, "The game should be for player 1");

        // player 1
        gamesInstance.markPosition(gameIdx, 2);

        (cells, status, amount, nick1, nick2) = gamesInstance.getGameInfo(gameIdx);
        Assert.equal(uint(cells[0]), 2, "The board should be 2");
        Assert.equal(uint(cells[1]), 0, "The board should be empty");
        Assert.equal(uint(cells[2]), 1, "The board should be 1");
        Assert.equal(uint(cells[3]), 0, "The board should be empty");
        Assert.equal(uint(cells[4]), 0, "The board should be empty");
        Assert.equal(uint(cells[5]), 0, "The board should be empty");
        Assert.equal(uint(cells[6]), 0, "The board should be empty");
        Assert.equal(uint(cells[7]), 0, "The board should be empty");
        Assert.equal(uint(cells[8]), 0, "The board should be empty");
        Assert.equal(uint(status), 2, "The game should be for player 2");

        // player 2
        gamesInstance.markPosition(gameIdx, 3);

        (cells, status, amount, nick1, nick2) = gamesInstance.getGameInfo(gameIdx);
        Assert.equal(uint(cells[0]), 2, "The board should be 2");
        Assert.equal(uint(cells[1]), 0, "The board should be empty");
        Assert.equal(uint(cells[2]), 1, "The board should be 1");
        Assert.equal(uint(cells[3]), 2, "The board should be empty");
        Assert.equal(uint(cells[4]), 0, "The board should be empty");
        Assert.equal(uint(cells[5]), 0, "The board should be empty");
        Assert.equal(uint(cells[6]), 0, "The board should be empty");
        Assert.equal(uint(cells[7]), 0, "The board should be empty");
        Assert.equal(uint(cells[8]), 0, "The board should be empty");
        Assert.equal(uint(status), 1, "The game should be for player 1");

        // player 1
        gamesInstance.markPosition(gameIdx, 4);

        (cells, status, amount, nick1, nick2) = gamesInstance.getGameInfo(gameIdx);
        Assert.equal(uint(cells[0]), 2, "The board should be 2");
        Assert.equal(uint(cells[1]), 0, "The board should be empty");
        Assert.equal(uint(cells[2]), 1, "The board should be 1");
        Assert.equal(uint(cells[3]), 2, "The board should be empty");
        Assert.equal(uint(cells[4]), 1, "The board should be empty");
        Assert.equal(uint(cells[5]), 0, "The board should be empty");
        Assert.equal(uint(cells[6]), 0, "The board should be empty");
        Assert.equal(uint(cells[7]), 0, "The board should be empty");
        Assert.equal(uint(cells[8]), 0, "The board should be empty");
        Assert.equal(uint(status), 2, "The game should be for player 2");

        // player 2
        gamesInstance.markPosition(gameIdx, 6);

        (cells, status, amount, nick1, nick2) = gamesInstance.getGameInfo(gameIdx);
        Assert.equal(uint(cells[0]), 2, "The board should be 2");
        Assert.equal(uint(cells[1]), 0, "The board should be empty");
        Assert.equal(uint(cells[2]), 1, "The board should be 1");
        Assert.equal(uint(cells[3]), 2, "The board should be empty");
        Assert.equal(uint(cells[4]), 1, "The board should be empty");
        Assert.equal(uint(cells[5]), 0, "The board should be empty");
        Assert.equal(uint(cells[6]), 2, "The board should be empty");
        Assert.equal(uint(cells[7]), 0, "The board should be empty");
        Assert.equal(uint(cells[8]), 0, "The board should be empty");
        Assert.equal(uint(status), 12, "The game should be won by player 2");
        
    }
}
