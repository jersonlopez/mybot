const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser');
const config = require('./config')
const routes = require('./App/routes')

module.exports = (app) => {
  app.set('port', config.port)
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(morgan(config.morganMode))

  app.use(cors())
  app.options('*', cors())
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })

  app.use('/', routes)
}