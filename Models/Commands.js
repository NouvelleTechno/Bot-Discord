const { STRING } = require("sequelize");
const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("commands", {
        command: {
            type: Sequelize.STRING,
            unique: true
        },
        message: Sequelize.TEXT,
        deleteMessage: Sequelize.BOOLEAN
    });
}