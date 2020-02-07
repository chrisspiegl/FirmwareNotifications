const uuid = require('uuid')

module.exports = function (sequelize, Sequelize) {
  const Manufacturer = sequelize.define('Manufacturer', {
    idManufacturer: {
      type: Sequelize.UUID,
      defaultValue: () => uuid.v4(),
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    slug: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    url: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    visible: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    crawl: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    freezeTableName: true
  })

  // Class Method
  Manufacturer.associate = function (models) {
    return Promise.all([
      models.Manufacturer.hasMany(models.Device, {
        foreignKey: 'idManufacturer'
      })
      // models.Manufacturer.belongsTo(models.UserTelegram, {
      //   foreignKey: 'idUserTelegram',
      //   as: 'User',
      // }),
    ])
  }
  return Manufacturer
}
