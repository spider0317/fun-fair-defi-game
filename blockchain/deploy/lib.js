const fs = require("fs")
const path = require("path")
const Web3 = require("web3")
const HDWalletProvider = require("truffle-hdwallet-provider")

const { PROVIDER_URI, WALLET_MNEMONIC } = require("../env.json")
const provider = new HDWalletProvider(WALLET_MNEMONIC, PROVIDER_URI)
const web3 = new Web3(provider)

async function deploy(web3, fromAccount, ABI, bytecode, ...params) {
    const contract = new web3.eth.Contract(JSON.parse(ABI))

    const estimatedGas = await contract.deploy({ data: "0x" + bytecode, arguments: params }).estimateGas()

    const tx = await contract
        .deploy({ data: "0x" + bytecode, arguments: params })
        .send({ from: fromAccount, gas: estimatedGas + 200 })

    return tx.options.address
}

async function deployDapp() {
    const accounts = await web3.eth.getAccounts()

    console.log(`The account used to deploy is ${accounts[0]}`)
    console.log("Current balance: ", await web3.eth.getBalance(accounts[0]), "\n")

    const stringSupportAbi = fs.readFileSync(path.resolve(__dirname, "..", "build", "__contracts_StringSupport_sol_StringSupport.abi")).toString()
    const stringSupportBytecode = fs.readFileSync(path.resolve(__dirname, "..", "build", "__contracts_StringSupport_sol_StringSupport.bin")).toString()
    const gamesOnStakesAbi = fs.readFileSync(path.resolve(__dirname, "..", "build", "__contracts_GamesOnStakes_sol_GamesOnStakes.abi")).toString()
    const gamesOnStakesBytecode = fs.readFileSync(path.resolve(__dirname, "..", "build", "__contracts_GamesOnStakes_sol_GamesOnStakes.bin")).toString()

    try {
        console.log("Deploying StringSupport...")
        const stringSupportAddress = await deploy(web3, accounts[0], stringSupportAbi, stringSupportBytecode)
        console.log(`- StringSupport deployed at ${stringSupportAddress}\n`)

        const libPattern = /__.\/contracts\/StringSupport.sol:StringSupport___/g
        const linkedGamesOnStakesBytecode = gamesOnStakesBytecode.replace(libPattern, stringSupportAddress.substr(2))
        if (linkedGamesOnStakesBytecode.length != gamesOnStakesBytecode.length) {
            throw new Error("The linked contract size does not match the original")
        }

        console.log("Deploying GamesOnStakes...")
        const gamesOnStakesAddress = await deploy(web3, accounts[0], gamesOnStakesAbi, linkedGamesOnStakesBytecode, 0)
        console.log(`- GamesOnStakes deployed at ${gamesOnStakesAddress}`)
    }
    catch (err) {
        console.error("\nUnable to deploy:", err.message, "\n")
        process.exit(1)
    }
    process.exit()
}

module.exports = {
    deployDapp
}
