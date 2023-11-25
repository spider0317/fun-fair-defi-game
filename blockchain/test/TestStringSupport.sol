// test/TestStringSupport.sol
pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "../contracts/StringSupport.sol";

contract TestStringSupport {
    function testSaltedHash() public {
        bytes32 hash1 = StringSupport.saltedHash(123, "my salt here");
        bytes32 hash2 = StringSupport.saltedHash(123, "my salt 2 here");
        bytes32 hash3 = StringSupport.saltedHash(234, "my salt here");

        Assert.isNotZero(hash1, "Salted hash should be a valid string");

        Assert.notEqual(hash1, hash2, "Different salt should produce different hashes");
        Assert.notEqual(hash1, hash3, "Different numbers should produce different hashes");
        Assert.notEqual(hash2, hash3, "Different numbers and salt should produce different hashes");
    }
}