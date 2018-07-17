let mongoose = require('mongoose')
let schema = mongoose.Schema

let { informationSchema, userSchema } = require('./schema')

let information = new schema(informationSchema)  // Creacion del esquema en la DB
let user = new schema(userSchema)

let informationModel = mongoose.model('information', information) // creacion del modelo en la DB
let userModel = mongoose.model('user', user)

module.exports = { informationModel, userModel }