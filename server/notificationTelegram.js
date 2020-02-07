process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../config'))

const debug = require('debug')
const log = debug(`${config.slug}:notification:telegram`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:notification:telegram:error`)

const BotTelegram = require('node-telegram-bot-api')

const pnotice = require('pushnotice')(`${config.slug}:notification:telegram`, { env: config.env, chat: config.pushnotice.chat, debug: true, disabled: config.pushnotice.disabled })

const models = require('../database/models')

const bot = new BotTelegram(config.telegramBots.fwn.authToken, {
  polling: false, // disabled because it's just a sending worker
  webhook: false // disabled because it's just a sending worker
})

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

module.exports = {
  sendBotMessage
}
