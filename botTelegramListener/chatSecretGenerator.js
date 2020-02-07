process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../config'))

const debug = require('debug')
const log = debug(`${config.slug}:chatSecretGenerator`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:chatSecretGenerator:error`)

const crypto = require('crypto')

function generate (chatId) {
  const salt = crypto.randomBytes(20).toString('hex')
  const secret = crypto.createHmac('sha1', salt).update('' + chatId).digest('hex')
  return {
    secret: secret,
    salt: salt
  }
}

module.exports = {
  generate: generate
}
