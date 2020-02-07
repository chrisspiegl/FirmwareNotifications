process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../config'))

const debug = require('debug')
const log = debug(`${config.slug}:crawler`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:crawler:error`)

const moment = require('moment-timezone')
moment.tz.setDefault('UTC')

const crawlers = {
  canon: require('./canon'),
  gopro: require('./gopro')
}

const models = require('../database/models')

const start = async () => {
  log('Starting Crawler')
  await models.init()

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

  for await (const manufacturer of manufacturers) {
    log(`Crawling ${manufacturer.name}`)
    await crawlers[manufacturer.slug].start(manufacturer)
  }

  log('Finished Crawling All')
  process.exit()
}

start()
