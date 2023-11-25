import React, { Component } from "react"
import { connect } from "react-redux"
import { Row, Col, Divider, Button, Input, InputNumber, Spin, Icon, message, notification } from "antd"

import Media from "react-media"
import getGameOnStakesInstance from "../contracts/Games-On-Stakes"
import { getWebSocketWeb3 } from "../contracts/web3"
import ConfirmAcceptModal from "../widgets/confirm-accept-modal"
import { fetchOpenGames } from "../store/actions";

class MainView extends Component {
    constructor(props) {
        super(props)
        this.acceptForm = null

        this.state = {
            showCreateGame: false,
            creationLoading: false,
            acceptLoading: false,
            showAcceptModal: false,
            gameIdxToAccept: -1
        }
    }

    handleValue(ev) {
        if (!ev.target || !ev.target.name) return
        this.setState({ [ev.target.name]: ev.target.value })
    }

    createGame() {
        if (!this.state.nick) return message.error("Please, choose a nick")
        else if (this.state.nick.length < 2) return message.error("Please, choose a longer nick")
        else if (typeof this.state.number == "undefined") return message.error("Please, choose a random number")
        else if (!this.state.salt) return message.error("Please, type a random string")

        const GamesOnStakes = getGamesOnStakesInstance(true)
        const number = this.state.number % 256

        return GamesOnStakes.methods.saltedHash(number, this.state.salt).call()
            .then(hash => {
                let web3 = getWebSocketWeb3()
                let value = 0
                if (this.state.value) {
                    value = web3.utils.toWei(String(this.state.value), "ether")
                }

                this.setState({ creationLoading: true })
                return GamesOnStakes.methods.createGame(hash, this.state.nick).send({ value, from: this.props.accounts[0] })
            }).then(tx => {
                this.setState({ creationLoading: false })
                if (!tx.events.GameCreated || !tx.events.GameCreated.returnValues) {
                    throw new Error("The transaction failed")
                }

                this.props.dispatch({
                    type: "ADD_CREATED_GAME",
                    id: tx.events.GameCreated.returnValues.gameIdx,
                    number,
                    salt: this.state.salt
                })

                this.props.history.push(`/games/${tx.events.GameCreated.returnValues.gameIdx}`)

                notification.success({
                    message: 'Game created',
                    description: 'Your game has been created. Waiting for another user to accept it.',
                })
            }).catch(err => {
                this.setState({ creationLoading: false })

                let msg = err.message.replace(/\.$/, "").replace(/Returned error: Error: MetaMask Tx Signature: /, "")
                notification.error({
                    message: 'Game creation failed',
                    description: msg
                })
            })
    }

    saveAcceptFormRef(ref) {
        this.acceptForm = ref
    }

    showAcceptGameModal(idx) {
        if (!this.acceptForm) return

        this.setState({ showAcceptModal: true, gameIdxToAccept: idx })
    }

    hideAcceptGameModal() {
        this.setState({ showAcceptModal: false })
    }

    acceptGame() {
        const game = this.props.openGames[this.state.gameIdxToAccept]

        this.acceptForm.validateFields((err, values) => {
            if (err) return

            if (!values.nick) return message.error("Please, choose a nick")
            else if (values.nick.length < 2) return message.error("Please, choose a longer nick")
            else if (typeof values.number == "undefined") return message.error("Please, choose a random number")

            values.number = values.number % 256

            const GamesOnStakes = getGamesOnStakesInstance(true)

            this.setState({ acceptLoading: true, showAcceptModal: false })

            // TRANSACTION
            return GamesOnStakes.methods.acceptGame(game.id, values.number, values.nick)
                .send({ value: game.amount || 0, from: this.props.accounts[0] })
                .then(tx => {
                    this.setState({ acceptLoading: false })

                    if (!tx.events.GameAccepted || !tx.events.GameAccepted.returnValues) {
                        throw new Error("The transaction failed")
                    }
                    this.props.history.push(`/games/${game.id}`)

                    notification.success({
                        message: 'Game accepted',
                        description: 'You have accepted the game. Waiting for creator to confirm.',
                    })
                    this.props.dispatch(fetchOpenGames())
                })
                .catch(err => {
                    this.setState({ acceptLoading: false })

                    let msg = err.message.replace(/\.$/, "").replace(/Returned error: Error: MetaMask Tx Signature: /, "")
                    notification.error({
                        message: 'Failed to accept the game',
                        description: msg
                    })
                })

        })
    }

    renderOpenGameRow(game, idx) {
        let web3 = getWebSocketWeb3()
        return <Row key={idx} type="flex" justify="space-around" align="middle" className="open-game-row">
            <Col xs={2} sm={3}>
                <img src={idx % 2 ? require("../media/cross.png") : require("../media/circle.png")} />
            </Col>
            <Col xs={12} sm={15} style={{ marginTop: 0, fontSize: 16 }} className="open-game-row-text">
                {game.nick1} {game.amount && game.amount != "0" ? <small>({web3.utils.fromWei(game.amount)} Ξ)</small> : null}
            </Col>
            <Col xs={9} sm={6} className="open-game-row-accept">
                <Button type="primary" className="width-100" onClick={() => this.showAcceptGameModal(idx)}>Accept</Button>
            </Col>
        </Row>
    }

    renderListContent(openGames) {
        if (!openGames || !openGames.length) return <p className="light">There are no open games at the moment. You can create one!</p>
        else return openGames.map((game, idx) => this.renderOpenGameRow(game, idx))
    }

    renderGameList() {
        return <div className="card">
            <h1 className="light">GamesOnStakes</h1>
            <p className="light">GamesOnStakes is an Ethereum distributed app. Select a game to join or create a new one.</p>

            <Divider />

            {
                this.state.acceptLoading ?
                    <div className="text-center" style={{ margin: 50 }}>Please, wait  <Spin indicator={<Icon type="loading" style={{ fontSize: 14 }} spin />} /> </div> :
                    <div id="list">
                        {this.renderListContent(this.props.openGames)}
                    </div>
            }


            <Media query="(max-width: 767px)" render={() => [
                <Divider key="0" />,
                <Button type="primary" className="width-100" key="1"
                    onClick={() => this.setState({ showCreateGame: !this.state.showCreateGame })}>Start a new  game</Button>
            ]} />
        </div>
    }

    renderNewGame() {
        return <div className="card">
            <h1 className="light">New Game</h1>
            <p className="light">Enter your nick name, type a random number and some text.</p>

            <Divider />

            <Row gutter={16}>
                <Col>
                    <Input className="margin-bottom" placeholder="Nick name" name="nick" onChange={ev => this.handleValue(ev)} />
                </Col>
                <Col span={12}>
                    <InputNumber className="width-100" min={0} placeholder="Random number" name="number" onChange={value => this.setState({ number: value })} />
                </Col>
                <Col span={12}>
                    <Input placeholder="Type some text" name="salt" onChange={ev => this.handleValue(ev)} />
                </Col>
                <Col>
                    <p className="light"><small>This will be used to randomly decide who starts the game</small></p>
                </Col>
                <Col>
                    <br />
                    <p className="light">Do you want to bet some ether?</p>
                </Col>
                <Col>
                    <InputNumber className="margin-bottom width-100" placeholder="0.00 (optional)" name="value" onChange={value => this.setState({ value })} />
                </Col>
                <Col>
                    <Media query="(max-width: 767px)" render={() => (
                        <Button type="primary" className="margin-bottom width-100"
                            onClick={() => this.setState({ showCreateGame: !this.state.showCreateGame })}>Cancel</Button>
                    )} />

                    {
                        this.state.creationLoading ?
                            <div className="text-center">Please, wait  <Spin indicator={<Icon type="loading" style={{ fontSize: 14 }} spin />} /> </div> :
                            <Button type="primary" id="start" className="width-100" onClick={() => this.createGame()}>Start new game</Button>
                    }
                </Col>
            </Row>
        </div>
    }

    renderMobile() {
        return <Row>
            <Col md={24}>
                {
                    this.state.showCreateGame ? this.renderNewGame() : this.renderGameList()
                }
            </Col>
        </Row>
    }

    renderDesktop() {
        return <Row gutter={48}>
            <Col md={12}>
                {this.renderGameList()}
            </Col>
            <Col md={12}>
                {this.renderNewGame()}
            </Col>
        </Row>
    }

    render() {
        return <div id="main">
            <Media query="(max-width: 767px)">
                {
                    matches => matches ? this.renderMobile() : this.renderDesktop()
                }
            </Media>
            <ConfirmAcceptModal
                visible={this.state.showAcceptModal}
                ref={ref => this.saveAcceptFormRef(ref)}
                onCancel={() => this.hideAcceptGameModal()}
                onAccept={() => this.acceptGame()}
            />
        </div>
    }
}

export default connect(({ accounts, openGames }) => ({ accounts, openGames }))(MainView)
