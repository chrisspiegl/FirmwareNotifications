process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const path = require('path')
const config = require(path.join(__dirname, '../config'))

const debug = require('debug')
const log = debug(`${config.slug}:crawler:canon`)
log.log = console.log.bind(console)
const error = debug(`${config.slug}:crawler:canon:error`)

const cheerio = require('cheerio')
const moment = require('moment-timezone')
const objectHash = require('object-hash')
const pLimit = require('p-limit')
const puppeteer = require('puppeteer')
const semver = require('semver')
const slugify = require('slugify')
const textCleaner = require('text-cleaner')

moment.tz.setDefault('UTC')

const pnotice = require('pushnotice')(`${config.slug}:crawler:canon`, { env: config.env, chat: config.pushnotice.chat, debug: true, disabled: config.pushnotice.disabled })
const models = require('../database/models')

const configParallelAccessPages = 5
const configPuppeteerHeadless = true

const startBrowser = async () => {
  return puppeteer.launch({
    headless: configPuppeteerHeadless, // set to false to see the browser actions live
    args: [
      // '--disable-dev-profile',
      '--disable-geolocation',
      '--disable-gpu',
      '--disable-infobars',
      '--disable-notifications',
      // '--disable-session-crashed-bubble',
      // '--disable-setuid-sandbox',
      // '--disable-web-security',
      // '--no-sandbox',
      // '--no-zygote',
      '--silent-debugger-extension-api',
      '--single-process',
    ],
  })
}

const fetchModel = async (browser, manufacturer, device) => {
  log(`Loading data for ${manufacturer.name} ${device.name}`)
  try {
    const page = await browser.newPage().catch((e) => {
      log(e)
    })
    await page.goto(device.url, {
      waitUntil: 'load' // can also be set to `networkidle0` or `networkidle2` or `domcontentloaded`
    })
    const pageContentHtml = await page.content()
    await page.close()

    const $ = cheerio.load(pageContentHtml)
    const $firmwareUpdateSection = $('#downloads-firmware .data .dataTable tbody tr')

    await $firmwareUpdateSection.each(async function () {
      const $this = $(this)
      const name = textCleaner($this.find('td:nth-child(1)').text()).stripHtml().condense().trim().valueOf()
      const date = moment(new Date(Date.parse($this.find('td:nth-child(2)').text())).toUTCString()).startOf('day')
      const notes = null
      const notesUrl = device.url
      const version = name.match(/(?:Version|Ver.)\s((?:(?:[\d.])+\.?)+(?:-.*)?)/)[1] // Regex to match anything that looks like a SemVer

      const versionObject = {
        idDevice: device.idDevice,
        slug: slugify(`${name}`),
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
    })

    log(`Update crawledAt for ${manufacturer.name} ${device.name}`)
    await models.Device.update({
      crawledAt: new Date()
    }, {
      where: {
        idDevice: device.idDevice
      }
    })
  } catch (err) {
    pnotice(`fetchModel - ${manufacturer.name} ${device.name} — Unrecognized Error\n${JSON.stringify(err)}`, 'ERROR')
  }
}

const start = async (manufacturer) => {
  let browser
  try {
    log(`Running ${manufacturer.name} Crawler in ${process.env.NODE_ENV} environment`)

    const devices = manufacturer.Devices

    if (!devices || devices.length <= 0) {
      log(`No devices found for ${manufacturer.name}`)
      return
    }

    log(`Starting headless browser for ${manufacturer.name}`)
    browser = await startBrowser()

    const pLimiter = pLimit(configParallelAccessPages)

    const promises = devices.map((device) => {
      return pLimiter(async () => fetchModel(browser, manufacturer, device))
    })

    await Promise.all(promises)

    // TODO: DO not understand why this is firing before the actual create / already have logs appear
    log(`Finished running ${manufacturer.name} crawler`)
  } catch (err) {
    pnotice(`start ${manufacturer.name} — Unrecognized Error\n${JSON.stringify(err)}`, 'ERROR')
  } finally {
    log(`Closing headless browser for ${manufacturer.name}`)
    if (browser) await browser.close()
    log(`Closed headless browser for ${manufacturer.name}`)
  }
}

module.exports = {
  start
}
