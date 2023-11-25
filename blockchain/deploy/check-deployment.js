const fs = require("fs")
const path = require("path")
const Web3 = require("web3")
const HDWalletProvider = require("truffle-hdwallet-provider")

const { PROVIDER_URI, WALLET_MNEMONIC } = require("../env.json")
const provider = new HDWalletProvider(WALLET_MNEMONIC, PROVIDER_URI)
const web3 = new Web3(provider)

async function startGame() {
    const accounts = await web3.eth.getAccounts()

    const gamesOnStakesAbi = fs.readFileSync(path.resolve(__dirname, "..", "build", "__contracts_gamesOnStakes_sol_gamesOnStakes.abi")).toString()

    try {
        const gamesOnStakesInstance = new web3.eth.Contract(JSON.parse(gamesOnStakesAbi), "0xd27574De8b98782A089AE08B24366542dcf2b1fb")

        const hash = await gamesOnStakesInstance.methods.saltedHash(100, "initial salt").call()
        const tx = await gamesOnStakesInstance.methods.createGame(hash, "James").send({ from: accounts[0], value: web3.utils.toWei("0.001", "ether") })
        const gameIdx = tx.events.GameCreated.returnValues.gameIdx
        console.log("GAME CREATED", gameIdx)
        console.log(await gamesOnStakesInstance.methods.getGameInfo(gameIdx).call())
    }
    catch (err) {
        console.error("\nUnable to deploy:", err.message, "\n")
        process.exit(1)
    }
    process.exit()
}

startGame()
