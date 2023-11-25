// contracts/ StringSupport.sol
pragma solidity ^0.5.0;


library StringSupport {


  function saltedHash(uint8 randomNumber, string memory salt) public pure returns (bytes32) {
    bytes memory bNum = new bytes(1);
    bNum[0] = byte(randomNumber);

    return keccak256(bytes(concat(string(bNum), salt)));
    }

     
    function concat(string memory first, string memory second) internal pure returns (string memory){
        bytes memory bFirst = bytes(first);
        bytes memory bSecond = bytes(second);
        string memory memStr = new string(bFirst.length + bSecond.length);
        bytes memory result = bytes(memStr);
        uint k = 0;
        for (uint i = 0; i < bFirst.length; i++) {
            result[k] = bFirst[i];
            k++;
        }
        for (uint i = 0; i < bSecond.length; i++) {
            result[k] = bSecond[i];
            k++;
        }
        return string(result);
    }
}

