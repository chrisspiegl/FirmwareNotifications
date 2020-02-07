const uuid = require('uuid')

module.exports = function (sequelize, Sequelize) {
  const NotificationTelegram = sequelize.define('NotificationTelegram', {
    idNotificationTelegram: {
      type: Sequelize.UUID,
      defaultValue: () => uuid.v4(),
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    idChatTelegram: {
      type: Sequelize.BIGINT,
      unique: false,
      allowNull: false
    }
  }, {
    freezeTableName: true
  })

  // Class Method
  NotificationTelegram.associate = function (models) {
    return Promise.all([
      models.NotificationTelegram.belongsTo(models.ChatTelegram, {
        foreignKey: 'idNotificationTelegram'
      })
    ])
  }
  return NotificationTelegram
}
