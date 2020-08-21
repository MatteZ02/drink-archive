const database = require("./struct/database");
const config = require("./config.json");

module.exports = new database(config.database);