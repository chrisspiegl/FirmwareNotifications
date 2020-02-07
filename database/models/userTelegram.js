const uuid = require('uuid')

module.exports = function (sequelize, Sequelize) {
  const UserTelegram = sequelize.define('UserTelegram', {
    idUserTelegram: {
      type: Sequelize.BIGINT.UNSIGNED,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    idUser: {
      type: Sequelize.UUID,
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
  UserTelegram.associate = function (models) {
    return Promise.all([
      models.UserTelegram.belongsTo(models.User, {
        foreignKey: 'idUser'
      }),
      models.UserTelegram.hasMany(models.ChatTelegram, {
        foreignKey: 'idUserTelegram'
      }),
      models.UserTelegram.hasMany(models.NotificationTelegram, {
        foreignKey: 'idChatTelegram'
      })
    ])
  }
  return UserTelegram
}
