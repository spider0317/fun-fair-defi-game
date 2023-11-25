const fs = require("fs")
const path = require("path")
const Web3 = require("web3")

const web3 = new Web3("http://localhost:8545")

async function deploy(web3, fromAccount, ABI, bytecode, ...params) {
    const contract = new web3.eth.Contract(JSON.parse(ABI))

    const estimatedGas = await contract.deploy({ data: "0x" + bytecode, arguments: params }).estimateGas()

    const tx = await contract
        .deploy({ data: "0x" + bytecode, arguments: params })
        .send({ from: fromAccount, gas: estimatedGas + 200 })

    return tx.options.address
}

function setContractAddressToEnv(contractAddress) {
    if (!contractAddress) throw new Error("Invalid contract address")
    const filePath = path.resolve(__dirname, "..", ".env.test.local")
    let data = fs.readFileSync(filePath).toString()

    data = data.replace(/CONTRACT_ADDRESS=[^\n]+/, `CONTRACT_ADDRESS=${contractAddress}`)
    fs.writeFileSync(filePath, data)
}

async function deployContracts() {
    const accounts = await web3.eth.getAccounts()

    console.log(`The account used to deploy is ${accounts[0]}`)

    const supportStringAbi = fs.readFileSync(path.resolve(__dirname, "..", "..", "blockchain", "build", "__contracts_supportString_sol_supportString.abi")).toString()
    const supportStringBytecode = fs.readFileSync(path.resolve(__dirname, "..", "..", "blockchain", "build", "__contracts_supportString_sol_supportString.bin")).toString()
    const gamesOnStakesAbi = fs.readFileSync(path.resolve(__dirname, "..", "..", "blockchain", "build", "__contracts_gamesOnStakes_sol_gamesOnStakes.abi")).toString()
    const gamesOnStakesBytecode = fs.readFileSync(path.resolve(__dirname, "..", "..", "blockchain", "build", "__contracts_gamesOnStakes_sol_gamesOnStakes.bin")).toString()

    try {
        console.log("Deploying supportString...")
        const supportStringAddress = await deploy(web3, accounts[0], supportStringAbi, supportStringBytecode)
        console.log(`- supportString deployed at ${supportStringAddress}\n`)

        const libPattern = /__.\/contracts\/supportString.sol:supportString___/g
        const linkedgamesOnStakesBytecode = gamesOnStakesBytecode.replace(libPattern, supportStringAddress.substr(2))
        if (linkedgamesOnStakesBytecode.length != gamesOnStakesBytecode.length) {
            throw new Error("The linked contract size does not match the original")
        }

        console.log("Deploying gamesOnStakes...")
        const gamesOnStakesAddress = await deploy(web3, accounts[0], gamesOnStakesAbi, linkedgamesOnStakesBytecode, 0)
        console.log(`- gamesOnStakes deployed at ${gamesOnStakesAddress}`)

        // write .env.test.local
        setContractAddressToEnv(gamesOnStakesAddress)
    }
    catch (err) {
        console.error("\nUnable to deploy:", err.message, "\n")
        process.exit(1)
    }
    process.exit()
}

deployContracts()
