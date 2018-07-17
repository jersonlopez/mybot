const path = require('path')

require('dotenv').config({silent: true});

const rootPath = path.resolve(__dirname, '.')
const port = process.env.PORT || 9000
const morganMode = process.env.Dev ? 'dev' : 'tiny'

module.exports = {
  rootPath,
  port,
  morganMode
}