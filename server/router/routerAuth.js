process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../../config'))

const debug = require('debug')
const log = debug(`${config.slug}:router:auth`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:router:auth:error`)

const express = require('express')
const jwt = require('jsonwebtoken')

const routerError = require('./routerError')
const middleware = require('../middleware')
const models = require('../../database/models')

const auth = () => {
  const router = express.Router()
  router.get('/', middleware.catchErrors(async (req, res) => {
    if (req.session.user) {
      // User already logged in
      req.flash('info', 'You are already logged in')
      return res.redirect('/dashboard')
    }
    const response = {
      bodyClasses: 'pageAuth'
    }

    const botName = config.telegramBots.fwn.username

    response.telegramUrl = `tg://resolve?domain=${botName}&start=login`

    return res.render('auth/index', response)
  }))

  router.get('/verify', middleware.catchErrors(async (req, res) => {
    const response = {
      bodyClasses: 'pageAuth'
    }

    if (req.user) {
      req.flash('info', `You tried logging in again, if you are not @${req.user.username} (${req.user.nameFirst} ${req.user.nameLast}), please <a href="/auth/logout">logout</a>.`)
      return res.redirect('/dashboard')
    }

    const { token } = req.query

    if (!token) {
      error('no token in parameters')
      req.flash('alert', 'Login failed. Invalid login token.')
      return res.redirect('/auth')
    }

    let decoded
    try {
      decoded = jwt.verify(token, config.secrets.jwt)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        error('token expired', err)
        req.flash('alert', 'Login failed. Token expired.')
      } else {
        error('token verification failed', err)
        req.flash('alert', 'Login failed. Invalid login token.')
      }
      return res.redirect('/auth')
    }

    if (!Object.prototype.hasOwnProperty.call(decoded, 'idUser')) {
      error('does not have `idUser` in decoded jwt')
      req.flash('alert', 'Login failed. Invalid login token.')
      return res.redirect('/auth')
    }

    const { idUser } = decoded

    const user = await models.User.findByPk(idUser)
    if (!user) {
      error('no user with the idUser which got extracted from the token')
      req.flash('alert', 'Login failed. Invalid login token.')
      return res.redirect('/auth')
    }

    // Token verified, it was valid, and a user with the user ID exists in the database
    // TODO: maybe include a additional secret in the token generation? Or are the config based secret and stuff enough?
    req.flash('alert', 'Login succeeded.')
    const userObject = {
      idUser: idUser,
      lastLogin: new Date()
    }
    await user.set(userObject, null).save()
    // Successfully logged in
    req.session.user = {
      idUser: idUser
    }
    req.flash('info', 'Successfully signed in')
    return res.redirect('/dashboard')
  }))

  router.get('/logout', (req, res) => {
    return res.redirect('./signout')
  })
  router.get('/signout', middleware.catchErrors(async (req, res) => {
    await req.session.regenerate((err) => {
      if (err) {
        error('/auth/signout', err)
        return res.redirect('/')
      } else {
        req.flash('info', 'Successfully signed out')
        return res.redirect('/')
      }
    })
  }))

  return router
}

module.exports = {
  auth
}
