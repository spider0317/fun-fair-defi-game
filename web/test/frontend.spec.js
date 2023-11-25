const { expect } = require("chai")
const puppeteer = require("puppeteer")
const dappeteer = require("dappeteer")
const fs = require('fs')
const path = require('path')
const Web3 = require("web3")
const HDWalletProvider = require("truffle-hdwallet-provider")

var browser, metamask, web3
var player2
var GamesOnStakes
const DAPP_URL = "http://localhost:1234"
const DEFAULT_METAMASK_OPTIONS = { gasLimit: 6654755 }

describe("GamesOnStakes frontend", async function () {
    // INIT

    before(async function () {
        this.timeout(1000 * 35)

        // Browser init
        browser = await dappeteer.launch(puppeteer)
        metamask = await dappeteer.getMetamask(browser)

        // import MetaMask account, same as ganache
        const mnemonic = fs.readFileSync(path.resolve(__dirname, "..", "dev", "mnemonic.txt")).toString()
        await metamask.importAccount(mnemonic)
        await metamask.switchNetwork('localhost 8545') // ganache

        // Local init
        let provider = new HDWalletProvider(mnemonic, "http://localhost:8545", 0)
        player1 = provider.addresses[0]
        provider = new HDWalletProvider(mnemonic, "http://localhost:8545", 1)
        player2 = provider.addresses[0]
        web3 = new Web3(provider)

        const testEnv = fs.readFileSync(path.resolve(__dirname, "..", ".env.test.local")).toString()
        const address = testEnv.match(/CONTRACT_ADDRESS=([^\n]+)/)[1]

        const GamesOnStakesAbi = fs.readFileSync(path.resolve(__dirname, "..", "src", "contracts", "dip-dapp-doe.json")).toString()
        GamesOnStakes = new web3.eth.Contract(JSON.parse(GamesOnStakesAbi), address)
    })

    // CLEAN UP

    after(() => {
        if (web3 && web3.currentProvider) {
            if (web3.currentProvider.disconnect) {
                web3.currentProvider.disconnect()
            }
            else if (web3.currentProvider.connection) {
                web3.currentProvider.connection.close()
            }
        }

        if (browser) {
            return browser.close()
        }
    })

    // TEST CASES

    it("should create and play a game ending in draw", async function () {
        this.timeout(1000 * 60)

        // open localhost
        const page = await browser.newPage()
        await page.goto(DAPP_URL)

        // The game list should be empty
        await page.waitForSelector('#main #list')
        let handle = await page.$$('#list > *')
        expect(handle.length).to.equal(1)

        handle = await page.$('#list')
        expect(await handle.$eval('p', node => node.innerText)).to.equal("There are no open games at the moment. You can create one!")

        // CREATE A GAME

        await page.type('input[name="nick"]', "Sachin")
        await page.type('input[name="number"]', "234")
        await page.type('input[name="salt"]', "My salt here")
        await page.type('input[name="value"]', "1")

        await page.click('#start')
        await delay(200)
        await metamask.confirmTransaction(DEFAULT_METAMASK_OPTIONS)

        // wait for tx
        await page.bringToFront()
        await page.waitFor(
            () => document.querySelector('#start') == null,
            { timeout: 30 * 1000 }
        )

        await page.waitForSelector('#game')
        await delay(1000)

        // NOTIFICATION

        await page.waitForSelector('.ant-notification-notice-with-icon')
        handle = await page.$('.ant-notification-notice-with-icon')
        expect(await handle.$eval('.ant-notification-notice-description', node => node.innerText)).to.equal("Your game has been created. Waiting for another user to accept it.")

        // ACCEPT THE GAME (player 2)

        let hash = await page.evaluate(() => {
            return document.location.hash
        })
        expect(hash).to.match(/^#\/games\/[0-9]+$/)
        let gameIdx = hash.match(/#\/games\/([0-9]+)/)
        gameIdx = gameIdx[1]
        expect(gameIdx).to.equal("0")

        let tx = await GamesOnStakes.methods.acceptGame(Number(gameIdx), 78, "Sanchay").send({ from: player2, value: web3.utils.toWei("1", "ether") })
        expect(tx.events.GameAccepted.returnValues.gameIdx).to.equal(gameIdx)

        // NOTIFICATION

        await delay(2000)

        await page.waitForSelector('.ant-notification-notice-with-icon')
        handle = await page.$$('.ant-notification-notice-with-icon')
        let value = await handle[1].$eval(".ant-notification-notice-description", node => node.innerText)
        expect(value).to.equal("Sanchay has accepted the game!")

        // SHOULD BE CONFIRMING THE GAME

        await delay(1500)

        await page.waitForSelector('#game .loading-spinner')
        value = await page.$eval("#game .loading-spinner", node => node.innerText)
        expect(value).to.equal("Waiting ")

        await delay(200)
        await metamask.confirmTransaction(DEFAULT_METAMASK_OPTIONS)

        // wait for tx
        await page.bringToFront()
        await delay(1000)

        // SHOULD BE CONFIRMED

        await page.waitForSelector('.ant-notification-notice-description')
        value = await page.$eval(".ant-notification-notice-description", node => node.innerText)
        expect(value).to.equal("The game is on. Good luck!")

        await page.waitForSelector('#status')
        value = await page.$eval("#status", node => node.innerText)
        expect(value).to.equal("It's your turn")

        value = await page.$eval("#timer", node => node.innerText)
        expect(value).to.match(/Remaining time: [0-9]+ minutes before Sanchay can claim the game/)

        value = await page.$eval("#bet", node => node.innerText)
        expect(value).to.equal("Game bet: 1 Ξ")

        // CHECK STATUS

        expect(await page.$eval("#cell-0", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-1", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-2", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-3", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-4", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-5", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-6", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-7", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-8", node => node.className)).to.equal("cell")

        // MARKING CELLS

        await markBrowserPosition(0, "Sanchay", page, metamask)
        await markPosition(gameIdx, 2, "Sanchay", page)
        await markBrowserPosition(4, "Sanchay", page, metamask)
        await markPosition(gameIdx, 8, "Sanchay", page)
        await markBrowserPosition(5, "Sanchay", page, metamask)
        await markPosition(gameIdx, 3, "Sanchay", page)
        await markBrowserPosition(6, "Sanchay", page, metamask)

        // THE OPPONENT MARKS HIS LAST POSITION

        tx = await GamesOnStakes.methods.markPosition(Number(gameIdx), 1).send({ from: player2 })
        expect(tx.events.PositionMarked.returnValues.gameIdx).to.equal(gameIdx)
        await delay(200)

        await page.waitForSelector('#game .loading-spinner')
        value = await page.$eval("#game .loading-spinner", node => node.innerText)
        expect(value).to.equal("Waiting ")

        // CONFIRM THE AUTO ENDING MOVEMENT

        await metamask.confirmTransaction(DEFAULT_METAMASK_OPTIONS)
        await page.bringToFront()

        await page.waitForSelector('#status')
        value = await page.$eval("#status", node => node.innerText)
        expect(value).to.equal("The game ended in draw")

        await page.waitForSelector('#withdraw')
        value = await page.$eval("#withdraw", node => node.innerText)
        expect(value).to.equal("Withdraw 1 Ξ")

        // WITHDRAW 

        await page.click("#withdraw")
        await delay(200)
        await metamask.confirmTransaction(DEFAULT_METAMASK_OPTIONS)

        await page.bringToFront()
        await delay(3000)

        await page.waitForSelector('.ant-notification-notice-description')
        value = await page.$eval(".ant-notification-notice-description", node => node.innerText)
        expect(value).to.equal("The money has been withdrawn")
        
        await delay(200)
        await page.waitFor(
            () => document.querySelector('#withdraw') == null,
            { timeout: 1000 * 30}
        )

        // GO BACK

        await page.click("#back")
        await delay(200)

        hash = await page.evaluate(() => {
            return document.location.hash
        })
        expect(hash).to.equal("#/")

        await page.close()
    })

    it("should play a game created and won by the opponent", async function () {
        this.timeout(1000 * 60)

        // open localhost
        const page = await browser.newPage()
        await page.goto(DAPP_URL)

        // The game list should be empty
        await page.waitForSelector('#main #list')
        let handle = await page.$$('#list > *')
        expect(handle.length).to.equal(1)

        handle = await page.$$('.open-game-row')
        expect(handle.length).to.equal(0)

        handle = await page.$('#list')
        expect(await handle.$eval('p', node => node.innerText)).to.equal("There are no open games at the moment. You can create one!")

        // CREATE A GAME

        let hash = await GamesOnStakes.methods.saltedHash(100, "player 2 salt").call()

        let tx = await GamesOnStakes.methods.createGame(hash, "").send({ from: player2, value: web3.utils.toWei("0.1", "ether") })
        expect(tx.events.GameCreated.returnValues.gameIdx).to.be.ok

        const gameIdx = tx.events.GameCreated.returnValues.gameIdx

        await page.waitForSelector('#main .open-game-row')
        let value = await page.$eval('.open-game-row .open-game-row-text', node => node.innerText)
        expect(value).to.equal("Sristi (0.1 Ξ)")

        await page.click('#main .open-game-row-accept')

        // ACCEPT THE GAME

        await page.waitForSelector(".ant-form-item-children input#nick")
        await page.type(".ant-form-item-children input#nick", "John")
        await page.type(".ant-form-item-children input#number", "10")
        await page.click(".ant-modal-footer .ant-btn.ant-btn-primary")

        await delay(500)
        await metamask.confirmTransaction(DEFAULT_METAMASK_OPTIONS)

        // wait for tx
        await page.bringToFront()
        // await page.waitFor(
        //     () => document.querySelector('#start') == null
        // )

        await page.waitForSelector('#game')
        await delay(1000)

        // NOTIFICATION

        await page.waitForSelector('.ant-notification-notice-with-icon')
        handle = await page.$('.ant-notification-notice-with-icon')
        expect(await handle.$eval('.ant-notification-notice-description', node => node.innerText)).to.equal("You have accepted the game. Waiting for creator to confirm.")

        // CONFIRM THE GAME

        tx = await GamesOnStakes.methods.confirmGame(gameIdx, 100, "player 2 salt").send({ from: player2 })
        expect(tx.events.GameStarted.returnValues.gameIdx).to.be.ok

        // SHOULD BE CONFIRMED

        await delay(4000)

        await page.waitForSelector('.ant-notification-notice-description')
        value = await page.$eval(".ant-notification-notice-description", node => node.innerText)
        expect(value).to.equal("Sristi has confirmed the game!")

        await page.waitForSelector('#status')
        value = await page.$eval("#status", node => node.innerText)
        expect(value).to.equal(`Waiting for Sristi`)
    
        value = await page.$eval("#timer", node => node.innerText)
        expect(value).to.match(/Remaining time: [0-9]+ minutes before You can claim the game/)
    
        value = await page.$eval("#bet", node => node.innerText)
        expect(value).to.match(/Game bet: [0-9\.]+ Ξ/)

        // EMPTY BOARD

        expect(await page.$eval("#cell-0", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-1", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-2", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-3", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-4", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-5", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-6", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-7", node => node.className)).to.equal("cell")
        expect(await page.$eval("#cell-8", node => node.className)).to.equal("cell")

        // MARKING CELLS

        await markPosition(gameIdx, 2, "Sristi", page, "x")
        await markBrowserPosition(0, "Sristi", page, metamask, "o")
        await markPosition(gameIdx, 4, "Sristi", page, "x")
        await markBrowserPosition(3, "Sristi", page, metamask, "o")
        
        // THE OPPONENT MARKS AND WINS

        tx = await GamesOnStakes.methods.markPosition(Number(gameIdx), 6).send({ from: player2 })
        expect(tx.events.PositionMarked.returnValues.gameIdx).to.equal(gameIdx)
        await delay(200)

        await page.waitForSelector('#status')
        value = await page.$eval("#status", node => node.innerText)
        expect(value).to.equal("Sristi is the winner of this game")

        await page.waitFor(
            () => document.querySelector(`#cell-6.cell.cell-x`) != null,
            { timeout: 10 * 1000 },
        )
        // no money on the game, no withdrawal available
        await page.waitFor(
            () => document.querySelector('#withdraw') == null,
            { timeout: 1000 * 30}
        )

        // GO BACK

        await page.click("#back")
        await delay(200)

        hash = await page.evaluate(() => {
            return document.location.hash
        })
        expect(hash).to.equal("#/")

        await page.close()
    })
})


// HELPERS

const delay = async interval => new Promise(resolve => setTimeout(resolve, interval))

async function markBrowserPosition(cell, opponent, page, metamask, symbol = "x") {
    await page.click(`#cell-${cell}`)
    await delay(100)
    await metamask.confirmTransaction(DEFAULT_METAMASK_OPTIONS)
    await page.bringToFront()
    await page.waitFor(
        (cell, symbol) => document.querySelector(`#cell-${cell}.cell.cell-${symbol}`) != null,
        { timeout: 10 * 1000 },
        cell, symbol
    )
    await delay(100)

    await page.waitForSelector('#status')
    let value = await page.$eval("#status", node => node.innerText)
    expect(value).to.equal(`Waiting for ${opponent}`)

    value = await page.$eval("#timer", node => node.innerText)
    expect(value).to.match(/Remaining time: [0-9]+ minutes before You can claim the game/)

    value = await page.$eval("#bet", node => node.innerText)
    expect(value).to.match(/Game bet: [0-9\.]+ Ξ/)
}

async function markPosition(gameIdx, cell, oponnent, page, symbol = "o") {
    let tx = await GamesOnStakes.methods.markPosition(Number(gameIdx), cell).send({ from: player2 })
    expect(tx.events.PositionMarked.returnValues.gameIdx).to.equal(gameIdx)

    await delay(200)

    await page.waitForSelector('#status')
    let value = await page.$eval("#status", node => node.innerText)
    expect(value).to.equal("It's your turn")

    value = await page.$eval("#timer", node => node.innerText)
    expect(value).to.match(new RegExp(`Remaining time: [0-9]+ minutes before ${oponnent} can claim the game`))

    value = await page.$eval("#bet", node => node.innerText)
    expect(value).to.match(/Game bet: [0-9\.]+ Ξ/)

    await page.waitFor(
        (cell, symbol) => document.querySelector(`#cell-${cell}.cell.cell-${symbol}`) != null,
        { timeout: 10 * 1000 },
        cell, symbol
    )
    await delay(100)
}
