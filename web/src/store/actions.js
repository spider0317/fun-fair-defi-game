import getGamesOnStakesInstance from "../contracts/Games-On-Stakes"

export function fetchOpenGames() {
    // NOTE: Using the read-only instance
    const GamesOnStakes = getGamesOnStakesInstance(false)

    return (dispatch, getState) => {
        GamesOnStakes.methods.getOpenGames().call().then(games => {
            return Promise.all(games.map(gameId => {
                return GamesOnStakes.methods.getGameInfo(gameId).call()
                    .then(gameData => {
                        gameData.id = gameId
                        return gameData
                    })
            })).then(games => {
                dispatch({ type: "SET", openGames: games })
            })
        })
    }
}
