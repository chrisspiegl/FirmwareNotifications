process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../config'))

const debug = require('debug')
const log = debug(`${config.slug}:bot:telegram:authentication`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:bot:telegram:authentication:error`)

const pnotice = require('pushnotice')(`${config.slug}:bot:telegram:authentication`, { env: config.env, chat: config.pushnotice.chat, debug: true, disabled: config.pushnotice.disabled })

const chatSecretGenerator = require('./chatSecretGenerator')
const models = require('../database/models')

exports.createMiddleware = function (options) {
  return function * () {
    this.auth = yield authByChatId(this.msg)
  }
}

const authByChatId = function * (msg) {
  try {
    // Craete or Update UserTelegram and User Database Entries
    let userTelegram = yield models.UserTelegram.findByPk(msg.from.id, { include: [models.User] })
    const userTelegramObj = {
      idUserTelegram: msg.from.id,
      nameFirst: msg.from.first_name,
      nameLast: msg.from.last_name,
      username: msg.from.username,
      languageCode: msg.from.language_code,
      lastLogin: new Date(),
      deactivatedAt: null, // set to null whenever user interacts with the bot to make sure the user is reactivated when activity is seen
      User: {
        nameFirst: msg.from.first_name,
        nameLast: msg.from.last_name,
        username: msg.from.username,
        languageCode: msg.from.language_code,
        lastLogin: new Date(),
        deactivatedAt: null // set to null whenever user interacts with the bot to make sure the user is reactivated when activity is seen
      }
    }
    if (!userTelegram) {
      log(`new user started bot ${msg.from.first_name} ${msg.from.last_name} (@${msg.from.username} / ${msg.from.language_code} / ${msg.chat.id}).`)
      pnotice(`new user started bot ${msg.from.first_name} ${msg.from.last_name} (@${msg.from.username} / ${msg.from.language_code} / ${msg.chat.id}).`)
      // NOTE: May have to update based on user registration possible through othermeans.
      userTelegram = yield models.UserTelegram.create(userTelegramObj, { include: [models.User] }) // can create at the same time because no user exists on the website yet for sure
    } else {
      log(`updating user details ${msg.from.first_name} ${msg.from.last_name} (@${msg.from.username} / ${msg.from.language_code} / ${msg.chat.id}).`)
      userTelegram.User.set(userTelegramObj.User, null)
      delete userTelegramObj.User
      userTelegram.set(userTelegramObj)
      yield userTelegram.save()
      yield userTelegram.User.save()
    }

    // Create or Update the Chat in the Database
    let chat = yield models.ChatTelegram.findByPk(msg.chat.id, { include: [{ model: models.UserTelegram, include: [models.User] }] })
    const chatObj = {
      idChatTelegram: msg.chat.id,
      title: msg.chat.title,
      idUserTelegram: userTelegram.idUserTelegram,
      type: msg.chat.type,
      lastCommandAt: new Date(),
      deactivatedAt: null // set to null whenever user interacts with the bot to make sure the user is reactivated when activity is seen
    }
    if (!chat) {
      log(`new chat \`${(msg.chat.title) ? msg.chat.title : 'direct'}\` started bot by ${msg.from.first_name} ${msg.from.last_name} (@${msg.from.username} / ${msg.from.language_code} / ${msg.chat.id}).`)
      pnotice(`new chat \`${(msg.chat.title) ? msg.chat.title : 'direct'}\` started bot by ${msg.from.first_name} ${msg.from.last_name} (@${msg.from.username} / ${msg.from.language_code} / ${msg.chat.id}).`)
      const generatedSecret = chatSecretGenerator.generate(chatObj.chatId)
      chatObj.secret = generatedSecret.secret
      chatObj.salt = generatedSecret.salt
      yield models.ChatTelegram.create(chatObj)
    } else {
      log(`updating chat \`${(msg.chat.title) ? msg.chat.title : 'direct'}\` by ${msg.from.first_name} ${msg.from.last_name} (@${msg.from.username} / ${msg.from.language_code} / ${msg.chat.id}).`)
      yield chat.update(chatObj)
    }
    chat = yield models.ChatTelegram.findByPk(msg.chat.id, { include: [{ model: models.UserTelegram, include: [models.User] }] })
    userTelegram = chat.UserTelegram
    const user = userTelegram.User
    return {
      chat, user, userTelegram
    }
  } catch (err) {
    error('authConnection error', err)
    // TODO: Fix this to be possible (or throw error to the upper layer)
    bot.sendMessage(msg.chat.id, 'Sorry - internal bot error. Please contact @FirmwareNotificationsGroup to debug this.')
  }
}
