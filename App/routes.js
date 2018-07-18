'use strict'

const Router = require('express').Router
const { watsonAssistant, pong, saveUser } = require("./watson")
const { add, search, remove } = require("./discovery")
const {eventReceiver, tokenVerify} = require('./webhook')

let router = new Router()

router.route('/ping').get((req, res) => {
    pong(...args)
})

router.route('/watson').post((...args) => {
    watsonAssistant(...args)
})

router.route('/users').post((...args) => {
    saveUser(...args)
})

router.route('/discovery/:query').get((...args) => {
    search(...args)
})

router.route('/webhook').post((...args) => {
    eventReceiver(...args)
});

router.route('/webhook').get((...args) => {
    tokenVerify(...args)
});

module.exports = router