const uuid = require('uuid')

module.exports = function (sequelize, Sequelize) {
  const DeviceFollower = sequelize.define('DeviceFollower', {
    idDeviceFollower: {
      type: Sequelize.UUID,
      defaultValue: () => uuid.v4(),
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    idDevice: {
      type: Sequelize.UUID,
      unique: false,
      allowNull: false
    },
    idUser: {
      type: Sequelize.UUID,
      unique: false,
      allowNull: false
    }
  }, {
    freezeTableName: true
  })

  // Class Method
  DeviceFollower.associate = function (models) {
    return Promise.all([
    ])
  }
  return DeviceFollower
}
