const uuid = require('uuid')

module.exports = function (sequelize, Sequelize) {
  const ChatTelegram = sequelize.define('ChatTelegram', {
    idChatTelegram: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    idUserTelegram: {
      type: Sequelize.BIGINT.UNSIGNED,
      unique: false,
      allowNull: false
    },
    title: Sequelize.STRING,
    type: Sequelize.STRING,
    secret: Sequelize.STRING,
    salt: Sequelize.STRING,
    lastCommandAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: () => new Date()
    }
  }, {
    freezeTableName: true
  })

  // Class Method
  ChatTelegram.associate = function (models) {
    return Promise.all([
      models.ChatTelegram.hasMany(models.NotificationTelegram, {
        foreignKey: 'idChatTelegram'
      }),
      models.ChatTelegram.belongsTo(models.UserTelegram, {
        foreignKey: 'idUserTelegram'
      })
    ])
  }
  return ChatTelegram
}
