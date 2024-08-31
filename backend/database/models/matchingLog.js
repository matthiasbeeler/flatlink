module.exports = (sequelize, DataTypes) => {
    const matchLog = sequelize.define("matchLog", {
        likeId:{
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        searcherId:{
            allowNull: false,
            type: DataTypes.UUID,
        },
        providerId:{
            allowNull: false,
            type: DataTypes.UUID,
        },
        matchType:{
            allowNull: false,
            type: DataTypes.BOOLEAN,
        }

    })
    matchLog.associate = (models) => {
        matchLog.belongsTo(models.providerPreferences, {
          foreignKey: 'providerId',
          targetKey: 'id'
        });
        matchLog.belongsTo(models.searcherPreferences, {
            foreignKey: 'searcherId',
            targetKey: 'id'
          });
          matchLog.belongsTo(models.User, {
            foreignKey: 'searcherId',
            targetKey: 'id'
          });
      };
    return matchLog;
}
//match like: 1
//match dislike: 0