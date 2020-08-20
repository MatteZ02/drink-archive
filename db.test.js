const database = require("./database");

const db = new database();

console.log(db.query("select * from auto"));