const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var Datastore = require('nedb')

require("dotenv").config();

db = new Datastore('datastore.db');
db.loadDatabase();

app.use(bodyParser.json())

app.use('/', require('./routes/all.js'));

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Magic at port ${port}`)
  })