process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../config'))

const debug = require('debug')
const log = debug(`${config.slug}:bot:telegram:notifier`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:bot:telegram:notifier:error`)

const BotTelegram = require('node-telegram-bot-api')
const moment = require('moment-timezone')

moment.tz.setDefault('UTC')

const pnotice = require('pushnotice')(`${config.slug}:bot:telegram:notifier`, { env: config.env, chat: config.pushnotice.chat, debug: true, disabled: config.pushnotice.disabled })

const models = require('../database/models')

// Be aware of the all encapsulating init method.
const init = async () => {
// Be aware of the all encapsulating init method.

  await models.init() // Loading Database Initialization
  const bot = new BotTelegram(config.telegramBots.fwn.authToken, {
    polling: false, // disabled because it's just a sending worker
    webhook: false // disabled because it's just a sending worker
  })

  // Handle Promise Rejections:
  process.on('unhandledRejection', (reason, promise) => {
    error('unhandledRejection', reason.stack || reason, promise)
  })

  // Function to send notification to chat
  const sendBotMessage = async (idChat, messageText) => {
    try {
      await bot.sendMessage(idChat, `${messageText}`, {
        parse_mode: 'markdown'
      })
    } catch (err) {
      if (err.code === 'ETELEGRAM') {
        if (err.response && err.response.body && err.response.body.error_code === 403) {
          log(`telegram user with idChat ${idChat} has deactivated the bot, deactivating the user in the database`)
          const userTelegram = await models.UserTelegram.findByPk(idChat)
          await userTelegram.update({
            deactivatedAt: new Date()
          })
        }
        return
      }
      log(`error sending the following message text to ${idChat}`, messageText, err)
    }
  }

  const Op = models.Sequelize.Op

  const daysHavePassed = moment().subtract(14, 'days').toDate()

  const usersWhoFollowDevices = await models.User.findAll({
    where: {
      deactivatedAt: null
    },
    include: [
      {
        model: models.Device,
        order: [['slug', 'ASC']],
        include: [
          models.Manufacturer,
          {
            model: models.Version,
            order: [
              ['date', 'DESC'],
              ['versionSemVer', 'DESC']
            ],
            where: {
              date: {
                [Op.gt]: daysHavePassed
              }
            },
            limit: 1
          }
        ]
      },
      {
        model: models.UserTelegram,
        where: {
          deactivatedAt: null
        },
        include: [{
          model: models.NotificationTelegram,
          where: {
            createdAt: {
              [Op.gt]: daysHavePassed
            }
          },
          order: [['createdAt', 'DESC']],
          limit: 1
        }]
      }
    ]
  })

  for await (const userWithDevices of usersWhoFollowDevices) {
    if (userWithDevices.UserTelegram.NotificationTelegrams.length > 0) continue // do not continue if user already got his notification

    const idChat = userWithDevices.UserTelegram.idUserTelegram

    let report = '*YOU GOT NEW FIRMWARE AVAILABLE*\n\n'
    let sendReport = false

    for await (const device of userWithDevices.Devices) {
      if (!device.Versions || device.Versions.length === 0) {
        continue
      }
      sendReport = true // is set to true if at least one device has a version
      const url = `${config.server.protocol}://${config.server.hostname}${config.server.portPublic === '' ? '' : ':' + config.server.portPublic}/${device.Manufacturer.slug}/${device.slug}`
      report += `${device.Manufacturer.name} ${device.name} - [Details](${url})\n`

      for await (const version of device.Versions) {
        report += `↳ \`${version.version}\` released on ${moment(version.date).format('YYYY-MM-DD')}\n\n`
      }
    }

    if (sendReport) await sendBotMessage(userWithDevices.UserTelegram.idUserTelegram, report)

    // Note the send of this notification
    await models.NotificationTelegram.create({
      idChatTelegram: idChat
    })
  }

// Be aware of the all encapsulating init method.
}
init()
// Be aware of the all encapsulating init method.
