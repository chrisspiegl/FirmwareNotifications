process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../../config'))

const debug = require('debug')
const log = debug(`${config.slug}:router:home`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:router:home:error`)

const express = require('express')

const routerError = require('./routerError')
const middleware = require('../middleware')
const models = require('../../database/models')

const home = () => {
  const router = express.Router()
  router.get('/', middleware.catchErrors(async (req, res) => {
    const response = {
      bodyClasses: 'pageHome'
    }

    response.count = {
      manufacturers: await models.Manufacturer.count({
        where: {
          visible: true
        }
      }),
      devices: await models.Device.count({
        where: {
          visible: true
        }
      }),
      versions: await models.Version.count({
        where: {
          visible: true
        }
      })
    }

    response.manufacturers = await models.Manufacturer.findAll({
      where: {
        visible: true
      },
      attributes: [
        'slug',
        'name',
        [models.sequelize.fn('count', 'Devices.idDevice'), 'countDevices']
      ],
      include: [{
        model: models.Device,
        attributes: [],
        where: {
          visible: true
        }
      }],
      group: [
        'Manufacturer.idManufacturer'
      ]
    })

    response.versions = await models.Version.findAll({
      order: [
        ['date', 'DESC'],
        ['versionSemVer', 'DESC']
      ],
      include: [{
        model: models.Device,
        include: [{
          model: models.Manufacturer
        }]
      }],
      limit: 10
    })

    return res.render('home', response)
  }))

  router.get('/:manufacturer', middleware.catchErrors(async (req, res) => {
    const response = {
      bodyClasses: 'pageManufacturer'
    }

    const { params } = req

    if (!params.manufacturer) {
      req.flash('warn', 'Manufacturer is not in url.')
      return res.redirect('/')
    }

    response.manufacturer = await models.Manufacturer.findOne({
      where: {
        slug: params.manufacturer,
        visible: true
      },
      attributes: [
        'idManufacturer',
        'slug',
        'name',
        [models.sequelize.fn('count', 'Devices.idDevice'), 'countDevices']
      ],
      include: [{
        model: models.Device,
        attributes: [],
        where: {
          visible: true
        }
      }],
      group: [
        'Manufacturer.idManufacturer'
      ]
    })

    if (!response.manufacturer) {
      return routerError.error404(req, res)
    }

    response.devices = await models.Device.findAll({
      where: {
        visible: true,
        idManufacturer: response.manufacturer.idManufacturer
      },
      attributes: [
        'idManufacturer',
        'slug',
        'name',
        [models.sequelize.fn('count', 'Versions.idVersion'), 'countVersions']
      ],
      order: [['slug', 'ASC']],
      include: [{
        model: models.Version,
        attributes: [],
        where: {
          visible: true
        }
      }],
      group: [
        'Device.idDevice'
      ]
    })

    return res.render('manufacturer', response)
  }))

  router.get('/:manufacturer/:device', middleware.catchErrors(async (req, res) => {
    const response = {
      bodyClasses: 'pageDevice'
    }

    const { params, query } = req

    if (!params.device) {
      req.flash('warn', 'Device is not set in URL.')
      return res.redirect('/')
    }

    response.manufacturer = await models.Manufacturer.findOne({
      where: {
        slug: params.manufacturer,
        visible: true
      }
    })

    if (!response.manufacturer) {
      return routerError.error404(req, res)
    }

    response.device = await models.Device.findOne({
      where: {
        slug: params.device,
        visible: true
      }
    })

    if (!response.device) {
      return routerError.error404(req, res)
    }

    const versionSelectOptions = {
      where: {
        visible: true
      },
      order: [
        ['versionSemVer', 'DESC'],
        ['date', 'DESC']
      ]
    }
    if (response.device) versionSelectOptions.where.idDevice = response.device.idDevice
    response.versions = await models.Version.findAll(versionSelectOptions)

    if (req.user) {
      if (parseInt(query.follow) === 1) {
        const hasDevice = await req.user.hasDevice(response.device)
        if (!hasDevice) {
          await req.user.addDevice(response.device)
          require('../notificationTelegram').sendBotMessage(req.userPersonalChat.idChatTelegram, `You started following ${response.manufacturer.name} ${response.device.name}.`)
          req.flash('info', `Started following ${response.manufacturer.name} ${response.device.name}.`)
        } else {
          req.flash('info', `Already following ${response.manufacturer.name} ${response.device.name}.`)
        }
      }
      if (parseInt(query.unfollow) === 1) {
        const hasDevice = await req.user.hasDevice(response.device)
        if (hasDevice) {
          await req.user.removeDevice(response.device)
          require('../notificationTelegram').sendBotMessage(req.userPersonalChat.idChatTelegram, `You stopped following ${response.manufacturer.name} ${response.device.name}.`)
          req.flash('info', `Stopped following ${response.manufacturer.name} ${response.device.name}.`)
        } else {
          req.flash('info', `Already not following ${response.manufacturer.name} ${response.device.name}.`)
        }
      }

      // Need to check the status after setting it if it has changed with this request.
      const userDevices = await req.user.countDevices({
        where: {
          idDevice: response.device.idDevice
        }
      })
      response.following = (!!userDevices)
    }

    return res.render('device', response)
  }))

  return router
}

module.exports = {
  home
}
