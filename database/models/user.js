const uuid = require('uuid')

module.exports = function (sequelize, Sequelize) {
  const User = sequelize.define('User', {
    idUser: {
      type: Sequelize.UUID,
      defaultValue: () => uuid.v4(),
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    username: Sequelize.STRING,
    nameFirst: Sequelize.STRING,
    nameLast: Sequelize.STRING,
    languageCode: Sequelize.STRING,
    lastLogin: {
      type: Sequelize.DATE,
      defaultValue: () => new Date(),
      allowNull: false
    },
    deactivatedAt: {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    }
  }, {
    freezeTableName: true
  })

  // Class Method
  User.associate = function (models) {
    return Promise.all([
      models.User.hasOne(models.UserTelegram, {
        foreignKey: 'idUser'
      }),
      models.User.belongsToMany(models.Device, {
        through: models.DeviceFollower,
        foreignKey: 'idUser'
      })
    ])
  }
  return User
}
