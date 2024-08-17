const { type } = require("express/lib/response");


module.exports = (sequelize, DataTypes) => {
  const providerPreferences = sequelize.define("providerPreferences", {
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
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        price: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: false
        },
        cleanliness: {
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
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: false
        },
        food: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: false
        },
        maleFlatmates: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: false
        },
        femaleFlatmates: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: false
        },
        noneFlatmates: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: false
        },
        intersexFlatmates: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: false
        },
        genderPreference: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: false
        },
        internet: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          unique: false
        },
        quietness: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: false
        },
        roomSize: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: false
        },
        washer: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          unique: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
          unique: false
        },
        street: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: false
        },
        place: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: false
        },
        plz: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: false
        },
        transportDistance: {
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        supermarketDistance: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        transportData: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        supermarketData: {
          type: DataTypes.JSON,
          allowNull: true
        },
        latitude: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        longitude: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        images: {
          type: DataTypes.JSON,
          allowNull: true
        },
  })
  return providerPreferences;
}