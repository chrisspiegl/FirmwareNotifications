const uuid = require('uuid')

module.exports = function (sequelize, Sequelize) {
  const Version = sequelize.define('Version', {
    idVersion: {
      type: Sequelize.UUID,
      defaultValue: () => uuid.v4(),
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    hash: {
      type: Sequelize.STRING,
      unique: false,
      allowNull: false
    },
    idDevice: {
      type: Sequelize.UUID,
      unique: false,
      allowNull: false
    },
    slug: {
      type: Sequelize.STRING,
      unique: false,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    version: {
      type: Sequelize.STRING,
      allowNull: false
    },
    versionSemVer: {
      type: Sequelize.STRING,
      allowNull: false
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    notesText: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    notesUrl: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    url: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    visible: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    freezeTableName: true
  })

  // Class Method
  Version.associate = function (models) {
    return Promise.all([
      models.Version.belongsTo(models.Device, {
        foreignKey: 'idDevice'
      })
    ])
  }
  return Version
}
