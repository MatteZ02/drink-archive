const { database } = require("../struct/database");
const config = require("../config.json");

const db = new database(config.database);

db.select({fields: "*", table: "accounts"}).then(res => console.log(res))