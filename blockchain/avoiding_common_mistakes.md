# Avoiding common attacks


### Circuit breaker

The contract owner is able to pause/unpause any action on the contract as an emergency stop-gap. As of right now, that does in fact mean that games can expire while the contract is paused.

### Tried-and-true packages and libraries

Importing and using battle-tested salted hash library for enhancing security.

...
function saltedHash(uint8 randomNumber, string memory salt) public pure returns (bytes32) {
    bytes memory bNum = new bytes(1);
    bNum[0] = byte(randomNumber);

    return keccak256(bytes(concat(string(bNum), salt)));
    }
...

### Delegatecall vulnerability

Learning from the Parity Wallet multi-sig hack, I avoided using delegatecall (although I don't have reason to use it for this project) and ensured the libraries I used don't carry that risk.

### Reentrancy

Learning from the DAO hack, I made sure that any functions moving value occur AFTER any and all state updates, as otherwise these state values will be vulnerable to reentrancy/recursive calls.


### Infinite loop gas trap / DoS attack

I don't loop/iterate over arrays of variable or undetermined length. In fact I avoided having to do array iterations by (for example) using explicit comparision instead of looping over all the cells. Only used looping in the library and tested it with etherscan.

### Contract balance dependency vulnerability

I don't use any code that depends on the contract's balance, as I know that Ether can be forcibly sent to the contract, even before deployment, and even can avoid a fallback function that isn't payable (such as when you selfdestruct() another contract and target this one to be paid).

### Data cleanliness

I sanitize user-input data by using function modifiers, and require conditions that validate the data before passing it to my functions.

### Function exposure security

I audited all my public-facing functions and interfaces and ensured all other functions are marked as "internal".

### Denial of service

Due to other contracts being able to play the game, if this app were to try to send them money and their fallback function was not payable, it would reject this app's payment attempt and short-circuit the function it is in. For this reason, I've implemented the "Balance Withdrawal" design pattern to separate ether transfer logic from game logic.

### Other

There are additional attack types that I not mention here because they're not highly relevant to this project, but I did spend a massive amount of time studying them all to be aware and knowledgable about them for future DApps!
