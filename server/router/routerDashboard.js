process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../../config'))

const debug = require('debug')
const log = debug(`${config.slug}:router:dashboard`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:router:dashboard:error`)

const express = require('express')

const middleware = require('../middleware')
const models = require('../../database/models')

const dashboard = () => {
  const router = express.Router()
  router.get('/', middleware.ensureLogin, middleware.catchErrors(async (req, res) => {
    const response = {
      bodyClasses: 'pageDashboard'
    }

    response.devices = await req.user.getDevices({
      include: [models.Manufacturer, {
        model: models.Version,
        order: [
          ['date', 'DESC'],
          ['versionSemVer', 'DESC']
        ],
        limit: 2
      }]
    })

    return res.render('dashboard/index', response)
  }))

  return router
}

module.exports = {
  dashboard
}
