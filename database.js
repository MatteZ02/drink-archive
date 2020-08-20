const mysql = require("mysql");
const util = require("util");
const config = require("./config.json");

module.exports = class database {
    constructor() {
        this.connection = mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database
          });
           
          this.connection.connect();
          this.query = util.promisify(this.connection.query);
    }
    async select (fields, table, where) {
      if (!fields) throw new Error(`fields must be of type "sting" type received was ${typeof fields}.`);
      if (!table) throw new Error(`table must be of type "sting" type received was ${typeof table}.`);
      if (where) {
        return await this.query(`select ${fields} from ${table} where ${where}`);
      } else {
        return await this.query(`select ${fields} from ${table}`);
      }
      
    }

}