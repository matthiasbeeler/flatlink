const { type } = require("express/lib/response");
module.exports = (sequelize, DataTypes) => {
    const searcherPreferences = sequelize.define("searcherPreferences", {
        id:{
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            unique: true
        },
        accessibility: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          balcony: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          budget: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
          },
          cleanliness: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
          },
          connections: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
          },
          flatmates: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
          },
          flatSize: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false
          },
          food: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false
          },
          gender: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false
          },
          genderPreference: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false
          },
          internet: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
          },
          quietness: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
          },
          roomSize: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false
          },
          washer: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false
          },
          preferredLat: {
            type: DataTypes.FLOAT,
            allowNull: false,
            unique: false
          },
          preferredLon: {
            type: DataTypes.FLOAT,
            allowNull: false,
            unique: false
          },
          description: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: false
          },
          occupation: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false
          }
    })
    return searcherPreferences;
}