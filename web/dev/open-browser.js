const puppeteer = require("puppeteer")
const dappeteer = require("dappeteer")
const fs = require('fs')
const path = require('path')

async function run() {
    try {
        const browser = await dappeteer.launch(puppeteer)
        const metamask = await dappeteer.getMetamask(browser)

        // import MetaMask account, same as ganache
        const mnemonic = fs.readFileSync(path.resolve(__dirname, "mnemonic.txt")).toString()
        await metamask.importAccount(mnemonic)

        // switch to localhost:8545
        await metamask.switchNetwork('localhost 8545') // ganache

        // open localhost
        const gamesOnStakes = await browser.newPage()
        await gamesOnStakes.goto("http://localhost:1234")
    }
    catch (err) {
        console.error(err)
        process.exit(1)
    }
}

run()
