const express = require('express')
const static = express.static('./public')

const {db} = require("./App/db/connection")

let app = new express()

db
require('./server')(app)
app.use(static); 

app.listen(app.get('port'), () => {
  console.log(`It's the best app running in... http://localhost:${app.get('port')}`)
})
