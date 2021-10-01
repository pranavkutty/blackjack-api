const mongoose = require('mongoose');

const handSchema = new mongoose.Schema({
    "gameid": String,
    "one": {
        "cards": [String],
        "handValue": {
            type: Number,
            default: 0
        },
        "bet": {
            type: Number,
            default: 0
        },
        "insuranceCoins": {
            type: Number,
            default: 0
        },
        "handStatus": {
            type: String,
            default: "ACTIVE"
        },
        "turn": {
            type: Number,
            default: 0
        },
        "payoff": {
            type: Number,
            default: 0
        }
    },
    "two": {
        "cards": [String],
        "handValue": {
            type: Number,
            default: 0
        },
        "bet": {
            type: Number,
            default: 0
        },
        "insuranceCoins": {
            type: Number,
            default: 0
        },
        "handStatus": {
            type: String,
            default: "INACTIVE"
        },
        "turn": {
            type: Number,
            default: 0
        },
        "payoff": {
            type: Number,
            default: 0
        }
    }
})

module.exports = mongoose.model('Hands', handSchema)

// const Hands = mongoose.model('Hands', handSchema)
// const temp = new Hands({
//     "1": {
//         "cards": ["1H", "5C"],
//         "handValue": 21,
//         "bet": 100,
//         "insuranceCoins": 48,
//         "turn": 3,
//         "payoff": 20
//     },
//     "2": {
//         "cards": ["1H", "5C"],
//         "handValue": 21,
//         "bet": 100,
//     }
// })

// console.log(temp)