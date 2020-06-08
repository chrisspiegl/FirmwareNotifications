process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../config'))

const debug = require('debug')
const log = debug(`${config.slug}:crawler`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:crawler:error`)

const pnotice = require('pushnotice')(`${config.slug}:crawler:index`, { env: config.env, chat: config.pushnotice.chat, debug: true, disabled: config.pushnotice.disabled })


const cron = require('cron')
const moment = require('moment-timezone')
const pLimit = require('p-limit')
moment.tz.setDefault('UTC')

const crawlers = {
  canon: require('./canon'),
  gopro: require('./gopro')
}

const models = require('../database/models')

const configParallelCrawlers = 1

const run = async () => {
  log('Running Crawler')

  const pLimiter = pLimit(configParallelCrawlers)

  const manufacturers = await models.Manufacturer.findAll({
    where: {
      crawl: true
    },
    include: [{
      model: models.Device,
      where: {
        crawl: true,
        crawledAt: {
          [models.Sequelize.Op.or]: [
            {
              [models.Sequelize.Op.lt]: moment().subtract(12, 'hour').toDate()
            },
            {
              [models.Sequelize.Op.eq]: null
            }
          ]
        }
      }
    }]
  })

  if (manufacturers.length === 0) log('Nothing to crawl, already finished with everything (or nothing enabled)')

  const promises = manufacturers.map((manufacturer) => {
    return pLimiter(async () => crawlers[manufacturer.slug].start(manufacturer))
  })

  await Promise.all(promises)

  log('Finished Crawling All')
}


const start = async () => {
  log('Starting Crawler')
  await models.init()
  const CronJob = cron.CronJob;
  const job = new CronJob('0 0 4 * * *', run, null, true, 'UTC', this, true);
  job.start();
}
start()

// Graceful shutdown
process.on('SIGINT', async () => {
  const cleanUp = async () => {
    // Clean up other resources like DB connections
    log('closing database connection')
    await models.sequelize.close()
  }

  // Force close server after 5secs
  setTimeout(async (e) => {
    log('Forcing server close !!!', e)

    await cleanUp()
    process.exit(1)
  }, 10000) // 10 seconds

  log('Closing crawler...')

  await cleanUp()
  process.exit()
})

process.on('unhandledRejection', async (reason, promise) => {
  error('unhandledRejection', reason.stack || reason, promise)
  pnotice(`unhandledRejection:\n${JSON.stringify(reason)}`, 'ERROR')
})
