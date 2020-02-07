'use strict'

const uuid = require('uuid')

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */

    const manufacturer = [
      {
        name: 'Canon',
        slug: 'canon',
        url: 'https://global.canon/'
      },
      {
        name: 'GoPro',
        slug: 'gopro',
        url: 'https://gopro.com'
      },
      {
        name: 'Nikon',
        slug: 'nikon',
        url: 'https://nikon.com'
      },
      {
        name: 'Panasonic',
        slug: 'panasonic',
        url: 'https://panasonic.com'
      },
      {
        name: 'Sony',
        slug: 'sony',
        url: 'https://sony.com'
      },
      {
        name: 'RED',
        slug: 'red',
        url: 'https://red.com'
      },
      {
        name: 'Atomos',
        slug: 'atomos',
        url: 'https://atomos.com'
      },
      {
        name: 'Rode',
        slug: 'rode',
        url: 'https://rode.com'
      }
    ]

    for (const manu of manufacturer) {
      manu.idManufacturer = uuid.v4()
      manu.createdAt = new Date()
      manu.updatedAt = new Date()
    }

    return queryInterface.bulkInsert('Manufacturer', manufacturer, {})
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */

    return queryInterface.bulkDelete('Manufacturer', null, {})
  }
}
