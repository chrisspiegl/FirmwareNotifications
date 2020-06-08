process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../config'))

const debug = require('debug')
const log = debug(`${config.slug}:crawler:gopro`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:crawler:gopro:error`)

const axios = require('axios')
const cheerio = require('cheerio')
const moment = require('moment-timezone')
const objectHash = require('object-hash')
const pLimit = require('p-limit')
const sanitizeHtml = require('sanitize-html')
const semver = require('semver')
const slugify = require('slugify')
const textCleaner = require('text-cleaner')

moment.tz.setDefault('UTC')

const pnotice = require('pushnotice')(`${config.slug}:crawler:gopro`, { env: config.env, chat: config.pushnotice.chat, debug: true, disabled: config.pushnotice.disabled })
const models = require('../database/models')

const configParallelAccessPages = 5

const fetchModel = async (manufacturer, device) => {
  log(`Loading data for ${manufacturer.name} ${device.name}`)
  try {
    const crawlResult = await axios.get(device.url)
    const $ = cheerio.load(crawlResult.data)

    const $firmwareUpdateSection = $('.gp-content-aligner-container.hidden-sm .firmware-release-notes')

    $firmwareUpdateSection.map(async function () {
      const $this = $(this)
      const name = textCleaner($this.find('.firmware-rn-fixed-text').html().split('<br>')[1]).stripHtml().condense().trim().valueOf()
      const date = moment(new Date(Date.parse(name.match(/\|\s(.*)/)[1])).toUTCString()).startOf('day')
      const notes = sanitizeHtml(textCleaner($this.find('.firmware-rn-collapsible-text').html()).condense().trim().valueOf())
      const notesUrl = device.url
      let version = name.match(/[v,D]((?:(?:[\d.])+\.?)+(?:-.*)?)/)[1] // Regex to match anything that looks like a SemVer
      if (version.startsWith('.')) version = `0${version}` // add leading 0 if version number starts with a `.`
      const versionSemVer = semver.valid(semver.coerce(version))
      if (versionSemVer == null) {
        // fix semver incompatible numbers which have leading `0` and double `00`
        version = version.split('.')
        for (let i = 0, length1 = version.length; i < length1; i++) {
          version[i] = parseInt(version[i])
        }
        version = version.join('.')
      }

      const versionObject = {
        idDevice: device.idDevice,
        slug: slugify(name),
        name: name,
        version: version,
        versionSemVer: semver.valid(semver.coerce(version)),
        date: date,
        url: device.url,
        notes: notes,
        notesUrl: notesUrl
      }

      versionObject.hash = objectHash.sha1({ idDevice: device.idDevice, name, version, date })
      let versionInDatabase = await models.Version.findOne({
        where: {
          hash: versionObject.hash
        }
      })
      if (!versionInDatabase) {
        versionInDatabase = await models.Version.create(versionObject)
        log(`created ${versionObject.version} ${versionObject.date.format('YYYY-MM-DD')} for ${manufacturer.name} ${device.name}`)
      } else {
        log(`already have ${versionObject.version} ${versionObject.date.format('YYYY-MM-DD')} for ${manufacturer.name} ${device.name}`)
      }

      await models.Device.update({
        crawledAt: new Date()
      }, {
        where: {
          idDevice: device.idDevice
        }
      })

      return versionInDatabase
    })
  } catch (err) {
    pnotice(`fetchModel — ${manufacturer} - ${device} — Unrecognized Error\n${JSON.stringify(err)}`, 'ERROR')
  }
}

const start = async (manufacturer) => {
  log(`Running ${manufacturer.name} Crawler in ${process.env.NODE_ENV} environment`)
  try {
    const devices = manufacturer.Devices

    const pLimiter = pLimit(configParallelAccessPages)

    const promises = devices.map((device) => {
      return pLimiter(async () => fetchModel(manufacturer, device))
    })

    await Promise.all(promises)

    // TODO: DO not understand why this is firing before the actual create / already have logs appear
    log(`Finished running ${manufacturer.name} crawler`)
  } catch (err) {
    pnotice(`start — ${manufacturer} — Unrecognized Error\n${JSON.stringify(err)}`, 'ERROR')
  }
}

module.exports = {
  start
}
