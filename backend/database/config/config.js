module.exports = {
    "development": {
      "username": process.env.dbUserDev,
      "password": process.env.dbPassDev,
      "database": process.env.dbDev,
      "host": process.env.dbHostDev,
      "dialect": "postgres"
    },
    "test": {
      "username": "root",
      "password": null,
      "database": "database_test",
      "host": "127.0.0.1",
      "dialect": "mysql"
    },
    "production": {
      "username": process.env.dbUser,
      "password": process.env.dbPass,
      "database": process.env.db,
      "host": process.env.dbHost,
      "dialect": "postgres"
    }
  }
  