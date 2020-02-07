const uuid = require('uuid')

module.exports = function (sequelize, Sequelize) {
  const LogRequest = sequelize.define('LogRequest', {
    idLogRequest: {
      type: Sequelize.UUID,
      defaultValue: () => uuid.v4(),
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    url: Sequelize.STRING,
    method: Sequelize.STRING,
    status: Sequelize.INTEGER,
    type: Sequelize.STRING,
    refHeader: Sequelize.STRING,
    refQuery: Sequelize.STRING,
    userAgent: Sequelize.STRING,
    browser: Sequelize.STRING,
    browserVersion: Sequelize.STRING,
    os: Sequelize.STRING,
    platform: Sequelize.STRING,
    bot: Sequelize.STRING,
    dnt: Sequelize.BOOLEAN,
    responseTime: Sequelize.FLOAT
  }, {
    freezeTableName: true
  })
  // Class Method
  LogRequest.associate = function (models) {
    return Promise.all([])
  }
  return LogRequest
}

// https://stackoverflow.com/questions/28895593/sequelize-grouping-by-hours-of-a-date-range

// var payments_by_hour = await Payment.findAll({
//   where: {
//     paid_at: {
//       $lte: '2015-01-31 23:00:00',
//       $gte: '2015-01-01 00:00:00'
//     }
//   },
//   attributes: [
//     [ sequelize.fn('date_trunc', 'hour', sequelize.col('updated_at')), 'hour'],
//     [ sequelize.fn('count', '*'), 'count']
//   ],
//   group: 'hour'
// });

// https://pusher.com/tutorials/realtime-analytics-dashboard-express
