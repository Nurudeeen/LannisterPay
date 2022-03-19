const express = require('express')
const app = express()
const bodyParser = require('body-parser')


require("dotenv").config();
const db = require("./model/db")


app.use(bodyParser.json())
db.connect();

app.use('/', require('./routes/fee'));
app.use('/', require('./routes/computeFee'));

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Magic at port ${port}`)
  })