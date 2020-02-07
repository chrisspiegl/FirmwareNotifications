const uuid = require('uuid')

module.exports = function (sequelize, Sequelize) {
  const Device = sequelize.define('Device', {
    idDevice: {
      type: Sequelize.UUID,
      defaultValue: () => uuid.v4(),
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    idManufacturer: {
      type: Sequelize.UUID,
      unique: false,
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
      allowNull: false
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
    },
    crawledAt: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    freezeTableName: true
  })

  // Class Method
  Device.associate = function (models) {
    return Promise.all([
      models.Device.hasMany(models.Version, {
        foreignKey: 'idDevice'
      }),
      models.Device.belongsTo(models.Manufacturer, {
        foreignKey: 'idManufacturer'
      }),
      models.Device.belongsToMany(models.User, {
        through: models.DeviceFollower,
        foreignKey: 'idDevice'
      })
    ])
  }
  return Device
}
