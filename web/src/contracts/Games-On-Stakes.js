import { getInjectedWeb3, getWebSocketWeb3 } from "./web3"
import gamesOnStakesAbi from "./GamesOnStakes.json"
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS

export default function (useBrowserWeb3 = false) {
    let web3
    if (useBrowserWeb3) {
        web3 = getInjectedWeb3()
    }
    else {
        web3 = getWebSocketWeb3()
    }
    return new web3.eth.Contract(gamesOnStakesAbi, CONTRACT_ADDRESS)
}
