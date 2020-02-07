process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../config'))

const debug = require('debug')
const log = debug(`${config.slug}:bot:telegram:listener`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:bot:telegram:listener:error`)

log(`Running Bot Telegram Listener in ${process.env.NODE_ENV} environment`)

const BotTelegram = require('node-telegram-bot-api')
const botTelegramMiddleware = require('node-telegram-bot-api-middleware')
const jwt = require('jsonwebtoken')
const moment = require('moment-timezone')

const pnotice = require('pushnotice')(`${config.slug}:bot:telegram:listener`, { env: config.env, chat: config.pushnotice.chat, debug: true, disabled: config.pushnotice.disabled })

moment.tz.setDefault('UTC')

// Mapping the use to a variable here - very useful
const use = botTelegramMiddleware.use

const authentication = require('./authentication')
const models = require('../database/models')

/**
 * =============================================================================
 * Bot Startup and Webhook Listening
 */

// Be aware of the all encapsulating init method.
const init = async () => {
// Be aware of the all encapsulating init method.

  await models.init() // Loading Database Initialization
  const bot = new BotTelegram(config.telegramBots.fwn.authToken, {
    polling: config.telegramBots.fwn.polling,
    webHook: (config.telegramBots.fwn.webHook === false) ? false : {
      host: config.telegramBots.fwn.webHook.host,
      port: config.telegramBots.fwn.webHook.port,
      autoOpen: false // open manually to log messages
    }
  })

  if (config.telegramBots.fwn.polling) {
    log('polling is activated')
    pnotice('Polling Activated')
  }

  bot.on('polling_error', (err) => {
    error('polling_error', err) // => 'EPARSE'
    pnotice(`Polling Error: ${err}`)
  })

  // Handle Promise Rejections:
  process.on('unhandledRejection', (reason, promise) => {
    error('unhandledRejection', reason.stack || reason, promise)
  })

  // TODO: Check how it all works with webhooks
  // if (config.telegramBots.fwn.webHook) {
  //   const webHookDomainPublic = `${config.server.protocol}://${config.server.hostname}${config.server.portPublic === '' ? '' : ':' + config.server.portPublic}`;
  //   const webHookDomainPrivate = `http://127.0.0.1:${config.telegramBots.fwn.webHook.port}`;
  //   const webHookURI = `/webhook/bot/telegram/${config.telegramBots.fwn.webHook.endpoint}/${config.telegramBots.fwn.authToken}`;
  //   bot.setWebHook(`${webHookDomainPublic}${webHookURI}`);
  //   bot.openWebHook().then(() => {
  //     log(`webhook server will listen on ${webHookDomainPrivate}${webHookURI}`);
  //     log(`telegram will hook into ${webHookDomainPublic}${webHookURI}`);
  //     pnotice(`Webhook Activated`);
  //     bot.on('webhook_error', (error) => {
  //       error('webhook_error', error.code);  // => 'EPARSE'
  //       pnotice(`Webhook Error: ${error.code}`);
  //     });
  //   }).catch((err) => {
  //       error(`could not open webhook on port ${config.telegramBots.fwn.webHook.port} endpoint ${config.telegramBots.fwn.webHook.endpoint}`, err);
  //       pnotice(`Webhook Error: could not open webhook on port ${config.telegramBots.fwn.webHook.port} endpoint ${config.telegramBots.fwn.webHook.endpoint}`);
  //   });
  // }

  /**
  * =============================================================================
  * Utilities
  */

  // const errorHandler = use(function* (fn) {
  //   return async function (fn) {
  //     try {
  //       return yield fn.apply(this, arguments);
  //     } catch (err) {
  //       error('Error Handler Catch', err, err.stack);
  //       return bot.sendMessage(this.msg.chat.id, `Sorry - internal bot error. Please contact @FirmwareNotificationsGroup to debug this.`);
  //     }
  //   }
  // };

  const authMiddleware = authentication.createMiddleware()

  const response = use(authMiddleware)

  const onlyGroupAdmin = response.use(function * () {
    const isGroupAdmin = yield checkIfUserIsAdmin(this.msg)
    if (!isGroupAdmin) {
      log(`user ${this.auth.user.username} tried to use admin only command`)
      yield bot.sendMessage(this.msg.chat.id, 'This command is only allowed for admins.')
      this.stop()
    }
  })

  const onlyPrivate = response.use(function * () {
    const isGroupChat = yield checkIfBotIsInGroup(this.msg)
    if (isGroupChat) {
      yield bot.sendMessage(this.msg.chat.id, 'This command is only allowed in private chats. Please talk to @FirmwareNotificationsBot directly.')
      this.stop()
    }
  })

  const authTokenGenerate = (idUser) => {
    return jwt.sign({ idUser: idUser }, config.secrets.jwt, { expiresIn: '15m' })
  }

  const checkIfBotIsInGroup = async (msg) => {
    const chatInfo = await bot.getChat(msg.chat.id)
    return (chatInfo.type !== 'private') ? chatInfo : false
  }

  const checkIfUserIsAdmin = async (msg) => {
    const chatInfo = await bot.getChat(msg.chat.id)
    if (chatInfo.type === 'private' || chatInfo.all_members_are_administrators === true) {
    // This is either a group where everybody is admin
    // Or it's a one on one chat between user and bot
      return true
    } else if (chatInfo.type === 'group' || chatInfo.type === 'supergroup') {
      const groupAdmins = await bot.getChatAdministrators(msg.chat.id)
      for (var i = groupAdmins.length - 1; i >= 0; i--) {
        if (groupAdmins[i].user.id === msg.from.id) {
        // The user is set as admin and is allowed to run the command
          return true
        }
      }
      return false
    }
  }

  /**
  * =============================================================================
  * Bot Command Listening Stuff
  */

  bot.onText(/\/start@?[A-z0-9._-]*? (.*)?/, onlyPrivate(async function (msg, match) {
    log(`command found in message ${msg.text} from user ${msg.from.id} in chat ${msg.chat.id}`)
    const command = match[1].slice(0, 'signin'.length)
    if (command === 'login') {
      const token = `${authTokenGenerate(this.auth.chat.UserTelegram.User.idUser)}`
      const link = `${config.server.protocol}://${config.server.hostname}${config.server.portPublic === '' ? '' : ':' + config.server.portPublic}/auth/verify?token=${token}`
      return bot.sendMessage(msg.chat.id, `🔑 Click or copy the link to login on the website: 🔑
${link}`)
    }

    return bot.sendMessage(msg.chat.id, 'Unsupported start command.')
  }))

  /**
  * =============================================================================
  * /login
  */
  bot.onText(/\/(login)@?[A-z0-9._-]*?$/, onlyPrivate(async function (msg, match) {
    log(`command found in message ${msg.text} from user ${msg.from.id} in chat ${msg.chat.id}`)
    const token = `${authTokenGenerate(this.auth.chat.UserTelegram.User.idUser)}`
    const link = `${config.server.protocol}://${config.server.hostname}${config.server.portPublic === '' ? '' : ':' + config.server.portPublic}/auth/verify?token=${token}`
    return bot.sendMessage(msg.chat.id, `🔑 Click or copy the link to login on the website: 🔑
${link}`)
  }))

  /**
  * =============================================================================
  * /help or /start
  */
  bot.onText(/\/(help|start)@?[A-z0-9._-]*?$/, response(async function (msg, match) {
    log(`command found in message ${msg.text} from user ${msg.from.id} in chat ${msg.chat.id}`)
    bot.sendMessage(msg.chat.id, `Hey ${msg.from.first_name},
I am 🤖 @FirmwareNotificationsBot 👋, I am here to give you notifications about firmware updates of gear you own (or would like to track). All delivered to this chat.

/help - Helpful info on how to use me
/login - Login on the website
/feedback - Send feedback to @FirmwareNotificationsGroup

To stay up to day with me, and know when I change the way I work, please join the @FirmwareNotificationsGroup.`, {
      parse_mode: 'markdown'
    })
  }))

  /**
  * =============================================================================
  * /feedback : tells user how to get help.
  */
  bot.onText(/\/only@?[A-z0-9._-]*?$/, onlyGroupAdmin(function (msg, match) {
    log(`command found in message ${msg.text} from user ${msg.from.id} in chat ${msg.chat.id}`)
    bot.sendMessage(msg.chat.id, 'You can only read this if you are a group admin.')
  }))

  /**
  * =============================================================================
  * /feedback : tells user how to get help.
  */
  bot.onText(/\/feedback@?[A-z0-9._-]*?$/, response(function (msg, match) {
    log(`command found in message ${msg.text} from user ${msg.from.id} in chat ${msg.chat.id}`)
    bot.sendMessage(msg.chat.id, `To send feedback, please join the @FirmwareNotificationsGroup for feature discussions, usage ideas, and to get future updates.

Thank You 😊`)
  }))

  /**
  * =============================================================================
  * /echo : replies with what was sent
  */
  bot.onText(/\/echo (.+)/, response(function (msg, match) {
    log(`command found in message ${msg.text} from user ${msg.from.id} in chat ${msg.chat.id}`)
    const chatId = msg.chat.id
    const resp = match[1] // the captured "whatever"
    bot.sendMessage(chatId, resp)
  }))

  /**
  * =============================================================================
  * Listen for any kind of message. There are different kinds of messages.
  * Don't do 'authConnection(function () => {})' here because it would duplicate the work done by the server
  */
  bot.on('message', (msg) => {
    log(`message received "${msg.text}" from {idUserTelegram: ${msg.from.id}, idChatTelegram: ${msg.chat.id}, username: ${msg.from.username}, title: ${msg.chat.title}, date: ${new Date(msg.date)}}`)
  })

// Be aware of the all encapsulating init method.
}
init()
// Be aware of the all encapsulating init method.
