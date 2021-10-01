const express = require('express');
const router = express.Router()
const Users = require('../models/Users')
const Games = require('../models/Games')
const Hands = require('../models/Hands')

module.exports = router


// endpoints related to USER AND GAME CREATION/STATUS

// create user
router.post("/create_user", async (req, res) => {

    const newUser = new Users({
        "name": req.body.name,
        "coins": req.body.coins
    })
    try {
        const dbRes = await newUser.save()
        res.status(201).json({ "user_id": dbRes._id })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//create game - creates new game and adds the game id in user collection
router.post("/create_game", async (req, res) => {
    const numDecks = req.body.decks
    const singleDeck = ["AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH", "AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS", "AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC", "AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD"]

    let finalDeck = []
    for (let i = 0; i < numDecks; i++) {
        finalDeck.push(...singleDeck)
    }

    let players = req.body.players

    const newGame = new Games({
        "players": players,
        "deck": finalDeck
    })


    try {
        let dbRes = await newGame.save()

        // add game to user collection
        players.forEach(async (player) => {
            let dbRes1 = await Users.findById(player)
            dbRes1.games.push(dbRes._id)
            dbRes1 = await dbRes1.save()
        })
        res.status(201).json({ "game_id": dbRes._id })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// utility functions
let drawCard = (dbRes) => {
    let random = Math.floor(Math.random() * dbRes.deck.length);
    let card = dbRes.deck[random]
    dbRes.deck.splice(random, 1)
    return card
}

let getCardValue = (card) => {
    if (card.length == 3 || card[0] == 'J' || card[0] == 'Q' || card[0] == 'K')
        return 10
    else if (card[0] == 'A')
        return 11
    else
        return (card[0] - '0')
}

// endpoints related to GAME CONTROLS and STATUS

// deal - creates new round or gives status of current round
router.post("/deal", async (req, res) => {
    try {
        let dbRes = await Games.findById(req.body.id)

        let players = dbRes.players
        let rounds = dbRes.rounds
        let numRounds = rounds.length

        // create new rounds if previous is finished
        if (numRounds == 0 || rounds[numRounds - 1].finished == true) {

            let dealerCards = []
            dealerCards.push(drawCard(dbRes))
            dealerCards.push(drawCard(dbRes))

            let round = {
                "dealerCards": dealerCards
            }

            let handArr = []
            rounds.push(round)
            numRounds = rounds.length
            await dbRes.save()

            let allPlayerCards = {}

            for (const [index, bet] of req.body.coins.entries()) {
                // subtract coins from user
                let dbRes1 = await Users.findById(players[index])
                dbRes1.coins -= bet
                await dbRes1.save()

                // create hand
                let playerCards = []
                let handValue = 0

                let card = drawCard(dbRes)
                playerCards.push(card)
                handValue += getCardValue(card)

                card = drawCard(dbRes)
                playerCards.push(card)
                handValue += getCardValue(card)
                let handStatus = "ACTIVE"
                let payoff = 0
                if (handValue == 21) {
                    payoff = Math.floor(1.5 * bet)
                    handStatus = "INACTIVE"
                }

                const newHand = new Hands({
                    "gameid": req.body.id,
                    "one": {
                        "cards": playerCards,
                        "handValue": handValue,
                        "bet": bet,
                        "payoff": payoff,
                        "handStatus": handStatus
                    }
                })

                dbRes1 = await newHand.save()
                handArr.push(dbRes1._id)

                allPlayerCards[players[index]] = {
                    "handid": dbRes1._id,
                    "cards": playerCards
                }
            }
            rounds[numRounds - 1].hands = handArr
            dbRes = await dbRes.save()

            round = dbRes.rounds[numRounds - 1]
            numRounds = dbRes.rounds.length

            res.status(201).json({
                "round id": round._id,
                "rounds_finished": round.finished,
                "dealer_cards": round.dealerCards,
                "turn": players[round.turn],
                "player_cards": allPlayerCards
            })

        }
        else {
            res.status(201).json({ "msg": "unfinished round exists! kindly complete them first before making a new round" })
        }
    }
    catch (err) {
        res.status(400).json({ "error": err })
    }
})

// insurance
router.post("/insurance", async (req, res) => {
    try {
        let insuranceArray = req.body.insurance
        for (const [index, value] of insuranceArray.entries()) {
            let dbRes = await Hands.findById(value.hand_id)
            console.log(value)
            if (dbRes.one.handStatus == "ACTIVE") {
                dbRes.one.insuranceCoins = value.insurance
            }
            else if (dbRes.two.handStatus == "ACTIVE") {
                dbRes.two.insuranceCoins = value.insurance
            }
            dbRes.save()
        }
        res.status(201).json({
            "msg": "insurance bet added"
        })
    }
    catch (err) {
        res.status(400).json({ "error": err })
    }
})

// hit
router.get("/hit/:hand_id", async (req, res) => {
    try {
        let dbRes = await Hands.findById(req.params.hand_id)

        if (dbRes.one.handStatus == "ACTIVE") {

            let dbRes1 = await Games.findById(dbRes.gameid)
            let newCard = drawCard(dbRes1)

            dbRes.one.turn += 1
            dbRes.one.handValue += getCardValue(newCard)
            dbRes.one.cards.push(newCard)

            if (dbRes.one.handValue > 21) {
                dbRes.one.handStatus = "BUST"
                dbRes.save()
                res.status(201).json({ "card drawn": newCard, "hand_value": "this hand is bust" })
            }
            else {
                dbRes.save()
                res.status(201).json({ "card drawn": newCard, "hand_value": dbRes.one.handValue })
            }
        }
        else if (dbRes.two.handStatus == "ACTIVE") {
            let dbRes1 = await Games.findById(dbRes.gameid)
            let newCard = drawCard(dbRes1)
            dbRes.two.turn += 1
            dbRes.two.handValue += getCardValue(newCard)
            dbRes.two.cards.push(newCard)

            if (dbRes.two.handValue > 21) {
                dbRes.two.handStatus = "BUST"
                dbRes.save()
                res.status(201).json({ "card drawn": newCard, "hand_value": "this hand is bust" })
            }
            else {
                dbRes.save()
                res.status(201).json({ "card drawn": newCard, "hand_value": dbRes.two.handValue })
            }
        }
        else {
            res.status(200).json({ "result": "Sorry! No active hands" })
        }
    }
    catch (err) {
        res.status(500).json({ "error": err })
    }
})

// stand
router.get("/stand/:hand_id", async (req, res) => {
    try {
        let dbRes = await Hands.findById(req.params.hand_id)

        if (dbRes.one.handStatus == "ACTIVE") {
            dbRes.one.handStatus = "INACTIVE"
            let dbRes1 = await Games.findById(dbRes.gameid)
            dbRes1.rounds[dbRes1.rounds.length - 1].turn += 1
            dbRes1.save()
            dbRes.save()
            res.status(200).json({
                "cards": dbRes.one.cards,
                "handstatus": dbRes.one.handStatus
            })
        }
        else {
            dbRes.two.handStatus = "INACTIVE"
            let dbRes1 = await Games.findById(dbRes.gameid)
            dbRes1.rounds[dbRes1.rounds.length - 1].turn += 1
            dbRes1.save()
            dbRes.save()
            res.status(200).json({
                "cards": dbRes.two.cards,
                "handstatus": dbRes.two.handStatus
            })
        }
    }
    catch (err) {
        res.status(500).json({ "error": err })
    }
})

// double down - double bet if hand value is 9,10 or 11
router.get("/double_down/:hand_id", async (req, res) => {
    try {
        let dbRes = await Hands.findById(req.params.hand_id)

        if (dbRes.one.handStatus != "ACTIVE")
            res.status(200).json({ "message": "hand is not active" })
        else if (dbRes.one.handValue == 11 || dbRes.one.handValue == 10 || dbRes.one.handValue == 9) {
            dbRes.one.bet *= 2
            dbRes.save()
            res.status(200).json({ "message": "bet doubled", "bet": dbRes.one.bet })
        }
        else {
            res.status(200).json({ "message": "current hand value not 9,10 or 11" })
        }
    }
    catch (err) {
        res.status(500).json({ "error": err })
    }
})

//split
router.get("/split/:hand_id", async (req, res) => {
    try {
        let dbRes = await Hands.findById(req.params.hand_id)
        if (dbRes.one.handStatus != "ACTIVE")
            res.status(200).json({ "message": "hand is not active" })
        if (dbRes.one.turn > 0)
            res.status(200).json({ "message": "Cannot split! Not your first turn" })

        if (dbRes.one.cards[0][0] == dbRes.one.cards[1][0]) {
            let splitBet = Math.floor(dbRes.one.bet / 2)
            let card = dbRes.one.cards[1]
            dbRes.one.cards.splice(1, 1)
            dbRes.one.handValue /= 2
            dbRes.one.bet = splitBet
            dbRes.one.turn = 0

            dbRes.two.cards.push(card)
            dbRes.two.handValue = dbRes.one.handValue
            dbRes.two.bet = splitBet
            dbRes.two.handStatus = "ACTIVE"

            dbRes.save()

            res.status(200).json({ "message": "cards split", "new_hands": dbRes })

        }
        else
            res.status(200).json({ "message": "Cannot split! Cards in hand are not equal" })
    }
    catch (err) {
        res.status(500).json({ "error": err })
    }
})

