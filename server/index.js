process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../config'))

const debug = require('debug')
const log = debug(`${config.slug}:server`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:server:error`)

log(`Running Server in ${process.env.NODE_ENV} environment`)

const pmx = require('pmx')
pmx.init({ http: true })

const bodyParser = require('body-parser')
const compression = require('compression')
const csurf = require('csurf')
const express = require('express')
const expressStatusMonitor = require('express-status-monitor')
const flash = require('express-flash')
const helmet = require('helmet')
const cors = require('cors')
const logger = require('morgan')
const morganBody = require('morgan-body')
const moment = require('moment-timezone')
const pug = require('pug')
const session = require('express-session')
const SessionRedisStore = require('connect-redis')(session)
const slashes = require('connect-slashes')

moment.tz.setDefault('UTC')

const models = require('../database/models')
const middleware = require('./middleware')
const pnotice = require('pushnotice')(`${config.slug}:server`, { env: config.env, chat: config.pushnotice.chat, debug: true, disabled: config.pushnotice.disabled })
const redis = require('./redis')

// Application
const app = express()
app.use(helmet())
app.use(cors())
// morganBody(app) // Log all messages including their parameters in a failry pretty way
app.use(logger('tiny')) // Less extreme logging of requests
app.use(middleware.analytics)
app.use(expressStatusMonitor())
app.enable('trust proxy') // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// app.use(require('./limiter').limiterReject); // Apply rate limiting to all routes
// app.use(require('./limiter').limiterSlowDown); // Apply limter to slow down to all routes
app.set('views', path.join(config.root, 'views'))
app.set('view engine', 'pug')
app.set('view cache', (config.envShort === 'pro'))
app.use(express.static(path.join(config.root, 'public')))
app.use(compression())
app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false })) // to support URL-encoded bodies

const sessionRedisStoreOptions = config.database.redis
sessionRedisStoreOptions.prefix = `${config.slugShort}:${config.envShort}:sess:`
sessionRedisStoreOptions.client = redis.redisClient
app.use(session({
  // https://lockmedown.com/securing-node-js-managing-sessions-express-js/
  store: new SessionRedisStore(sessionRedisStoreOptions),
  secret: config.secrets.session,
  resave: false,
  proxy: true,
  saveUninitialized: true,
  cookie: {
    path: '/',
    maxAge: 365 * 24 * 60 * 60 * 1000, // The maximum age (in milliseconds) of a valid session.
    secure: (config.server.protocol === 'https'),
    httpOnly: true // Since the session ID is of no use to the client, there is absolutely no reason that the front-end  application should ever have access to the session ID in the cookie.  However, by default, any script running on the front-end application will have access to a cookie’s contents.
  },
  name: 'id'
}))

app.use(flash())
app.use(middleware.extension)
app.use(require('./locals'))
app.use((err, req, res, next) => {
  // Error in the Express App
  error(err.message)
  pnotice(`app.use error ${err.message}`)
  next(err, req, res)
})
app.use((req, res, next) => {
  // Each and every request
  return next()
})
app.use(middleware.catchErrors(async (req, res, next) => {
  // Load the user from the session
  // This is specifically needed in PushNotice because we don't use passport.io
  if (req.session.user) {
    const user = await models.User.findByPk(req.session.user.idUser, {
      include: [{
        model: models.UserTelegram,
        include: [models.ChatTelegram]
      }]
    })

    if (!user) {
      error(`req.session.user.idUser is set to ${req.session.user.idUser} but there is no user with this id in the database`)
      await req.session.regenerate((err) => {
        if (err) {
          error('/auth/signout', err)
          return res.redirect('/')
        } else {
          req.flash('info', 'Successfully signed out')
          return res.redirect('/')
        }
      })
      req.user = undefined
      return next()
    }

    // Load the personal ChatTelegram for the user to send messages
    req.userPersonalChat = await models.ChatTelegram.findOne({
      where: {
        idUserTelegram: user.UserTelegram.idUserTelegram,
        type: 'private'
      }
    })
    req.user = user
    return next()
  }
  return next()
}))

// app.use('/api/v1', require('./router/routerApi').apiV1());
// app.use('/api', require('./router/routerApi').api());

app.use(slashes(false)) // has to be used after `/api` routes and `express.static` so it does not change those urls
app.use(csurf({ cookie: false }))

app.use('/auth', require('./router/routerAuth').auth())
app.use('/dashboard', require('./router/routerDashboard').dashboard())
// app.use('/open', require('./router/routerOpen').open());
app.use('/', require('./router/routerHome.js').home())
app.use(require('./router/routerError').error404)
app.use(require('./router/routerError').error500)

const server = app.listen(config.server.port, config.server.address, async () => {
  await models.init()
  const host = server.address().address
  const port = server.address().port
  const livereloadDate = new Date()
  const fs = require('fs')
  fs.writeFileSync(path.join(config.root, '/data/livereload.json'), JSON.stringify({ livereload: livereloadDate }), { flat: 'w' })
  console.log('Livereload written at ' + livereloadDate)
  console.log('App listening at ' + config.server.protocol + '://' + config.server.hostname + (config.server.portPublic === '' ? '' : ':' + config.server.portPublic))
  console.log(`Internal Adress: ${host}:${port}`)
  pnotice('App listening at ' + config.server.protocol + '://' + config.server.hostname + (config.server.portPublic === '' ? '' : ':' + config.server.portPublic))
})

// Graceful shutdown
process.on('SIGINT', () => {
  const cleanUp = () => {
    // Clean up other resources like DB connections
  }

  console.log('Closing server...')

  server.close(() => {
    console.log('Server closed !!! ')

    cleanUp()
    process.exit()
  })

  // Force close server after 5secs
  setTimeout((e) => {
    console.log('Forcing server close !!!', e)

    cleanUp()
    process.exit(1)
  }, 10000) // 10 seconds
})

process.on('unhandledRejection', (reason, promise) => {
  error('unhandledRejection', reason.stack || reason, promise)
  pnotice(`unhandledRejection:\n${JSON.stringify(reason)}`, 'ERROR');
  // routerError.error500(reason);
})
