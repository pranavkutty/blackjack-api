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
        res.status(200).json({ "user_id": dbRes._id })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//create game
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
        res.status(200).json({ "game_id": dbRes._id })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})