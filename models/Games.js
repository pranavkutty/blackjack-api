const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    "players": [String],
    "finished": {
        type: Boolean,
        default: false
    },
    "deck": [String],
    "rounds": [{
        "dealerCards": [String],
        "finished": {
            type: Boolean,
            default: false
        },
        "turn": {
            type: Number,
            default: 0
        },
        "hands": [String],
        "winners": [String]
    }]
})

module.exports = mongoose.model('Games', gameSchema)

// const Games = mongoose.model('Games', gameSchema)
// const temp = new Games({
//     "players": ["1", "2"],
//     "finished": false,
//     "deck": ["1H", "2S"],
//     "rounds": [
//         {
//             "dealerCards": ["1H", "2S"],
//             "finished": true,
//             "turn": 0,
//             "hands": {
//                 "1": "h1",
//                 "2": "h2"
//             },
//             "winners": ["1"]
//         },
//         {
//             "dealerCards": ["1H", "2S"],
//             "turn": 0,
//             "hands": {},
//             "winners": []
//         }
//     ]
// })

// // console.log(temp)
// let numRounds = temp.rounds.length
// temp.rounds[numRounds - 1].hands.set('alpha', 'calling beta')
// console.log(temp.rounds)