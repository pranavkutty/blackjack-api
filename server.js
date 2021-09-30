const express = require('express')
const app = express()
if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const mongoose = require('mongoose')

//connect to db
mongoose.connect(process.env.DATABASE_URL, { useUnifiedTopology: true, useNewUrlParser: true })
db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to database'))

app.use(express.json())

//routers
const router = require('./routes/game')

app.use('/api/v1', router)


//start server
app.listen(process.env.PORT || 8081, () => console.log("Server has started"));