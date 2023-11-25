const initialState = {
    loading: true,
    unsupported: false,
    connected: false,
    networkId: null,
    startingBlock: 0,
    // map createdGames[i] = { number: 1234, salt: "some salt here" }
    createdGames: JSON.parse(localStorage.getItem("createdGames") || "{}")
}

export default function reducer(state = initialState, action = {}) {
    let temp
    switch (action.type) {
        case 'SET_UNSUPPORTED':
            return Object.assign({}, state, { unsupported: true, loading: false })

        case 'SET_CONNECTED':
            return Object.assign({}, state, { connected: true, loading: false })

        case 'SET_DISCONNECTED':
            return Object.assign({}, state, { connected: false, loading: false })

        case 'SET_NETWORK_ID':
            return Object.assign({}, state, { networkId: action.networkId })

        case 'SET_STARTING_BLOCK':
            return Object.assign({}, state, { startingBlock: action.blockNumber })

        case 'ADD_CREATED_GAME':
            if (!action.id || typeof action.number == "undefined" || !action.salt) return state

            temp = Object.assign({}, state.createdGames, {
                [action.id]: { number: action.number, salt: action.salt }
            })
            localStorage.setItem("createdGames", JSON.stringify(temp))

            return Object.assign({}, state, {
                createdGames: temp
            })

        case 'REMOVE_CREATED_GAME':
            if (!action.id) return state

            temp = Object.assign({}, state.createdGames)
            delete temp[action.id]
            localStorage.setItem("createdGames", JSON.stringify(temp))

            return Object.assign({}, state, {
                createdGames: temp
            })

        default:
            return state
    }
}