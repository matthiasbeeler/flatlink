module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        id:{
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
          },
          lastName: {
            type: DataTypes.STRING,
            allowNull: false
          },
          email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
          },
          password: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
          },
          userType: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false
          },
          emailVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            unique: false,
            defaultValue: false,
          },

    })
    return User;
}