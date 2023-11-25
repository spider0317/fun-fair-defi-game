# fun-fair
Consensys-bootcamp-final-project

>Author: spider developer

## Aim

Create a gaming SDK, where gamers can clash with each other, and eventually put some skin in the game to make it more competitive.

## Motivation

- According to the stats of DApp reviewing websites, and consensys blogs. The blockchain mainstream adoption and increase in  DAU (Daily active users) can be enhanced by Games, and casinos. 


## What does your project do?
I have started on this path with a basic tic-tac-toe game.

### Use case of the project
- Sachin opens a game, bets 0.01 ether and appears in a list of users who are up to play. <br>
- Sanchay sees Sachin on the list and accepts the game by betting 0.01 ether too. <br>
- Sachin confirms and the game starts. <br>
- Sachin and Sanchay make their moves, one after each other. <br>
- If one of them wins, that player can withdraw 0.02 ether from the contract. <br>
- If the game ends in a draw, both users can withdraw their respective money i.e. 0.1 ether. <br>


## How to set it up ?

### Getting started

This project makes use of `runner-cli` as the task runner:

    npm i -g runner-cli

The tasks are declared in `blockchain/taskfile` and `web/taskfile`, which are shell scripts on steroids.

To see the available commands, simply invoke:

    run

To invoke a command:

    run build

Or:

    ./taskfile build

### Blockchain

* Install the dependencies: `run init`
* Run the test suite (for TDD): `run test`
* Compile the contracts: `run build`
* Deploy the contract to the blockchain: `run deploy`

### Web

* Develop with live reload: `run dev`
    * Start a local blockchain (Ganache)
    * Deploy the contracts to the local blockchain
    * Open Chromium with MetaMask pointing to ganache
    * Bundle the web and serve it with live reload
* Develop with live reload: `run dev ropsten`
    * Start a dev server with live reload
    * The ropsten test network will be used
* Build for release: `run build`
    * Bundle the static web assets to `./build`
* Run the E2E test: `run test`
    * Start a local blockchain
    * Deploy the contracts to the local blockchain
    * Bundle the web
    * Start a local server
    * Open Chromium (puppeteer)
    * Run the tests locally

## Dependencies

To work with this project you need:

	[sudo] npm i -g truffle parcel-bundler solc ganache-cli

* ParcelJS (HTML/JS/CSS bundler)
* Truffle (Solidity development tools)
* Solc (Solidity compiler)
* Ganache (local blockchain)

* Note: Change the mneumonic given in .secret file, and replace it with mneumonic given in your ganache-cli.

## Typical workflow

    [sudo] npm i -g runner-cli

## Deployment
Blockchain:

    cd blockchain
    run deploy  # implies "run build"

Frontend:

    cd web
    run build
    ls ./build  # your dist files are here



## Evaluation checklist

- [x] README.md
- [x] Screen recording [!!]
- [x] Truffle project - compile, migrate, test
- [x] Smart Contract Commented
- [x] Library use
- [x] Local development interface
    - [x] Displays the current ETH Account
    - [x] Can sign transactions using MetaMask
    - [x] App interface reflects contract state
- [x] 5 tests in Js or Sol
    - [x] Structured tests
    - [x] All pass
- [x] Circuit breaker/Emergency stop
- [x] Project includes a file called design_pattern_desicions.md / at least 2 implemented
- [x] avoiding_common_attacks.md and explains at least 3 attacks and how it mitigates
- [x] deployed_addresses.txt that indicates contract address on testnet
- [x] upgradeable design pattern
- [ ] One contract written in Vyper or LLL
- [ ] IPFS
- [ ] uPort
- [ ] ENS
- [ ] Oracle

## Future Prospects

1. Writing test for contract in JS
2. Using battle-tested contracts for enhancing security
3. Making code, and development workflow developer friendly.
4. Run the project, using docker. 




