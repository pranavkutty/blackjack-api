const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    "name": {
        type: String,
        required: true
    },
    "coins": {
        type: Number,
        required: true
    },
    "games": [String]

})

module.exports = mongoose.model('Users', userSchema)

// const Users = mongoose.model('Users', userSchema)
// const temp = new Users({
//     "name": 'pranav',
//     "coins": 152
// })

// console.log(temp.games)