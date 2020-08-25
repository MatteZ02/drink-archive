const mysql = require("mysql");

module.exports = class database {
    constructor(config) {
        this.connection = mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
          });
           
          this.connection.connect();
    }
    select (options) {
      if (!options.fields) options.fields = "*";
      if (typeof options !== "object") throw new Error(`The options must be of type "object" type received was ${typeof options}`);
      if (typeof options.fields !== "string") throw new Error(`fields must be of type "string" type received was ${typeof options.fields}.`);
      if (typeof options.table !== "string") throw new Error(`table must be of type "string" type received was ${typeof options.table}.`);
      if (options.where) {
        if (typeof options.where !== "string") throw new Error(`where must be of type "string" type received was ${typeof options.table}.`);
        if (options.username && options.password) {
          return new Promise(resolve => {
          this.connection.query(`select ${options.fields} from ${options.table} where ${options.where}`, [options.username, options.password], (error, results) => {
            if (error) throw new Error(error);
            resolve(results);
          });
        });
         } else
        return new Promise(resolve => {
        this.connection.query(`select ${options.fields} from ${options.table} where ${options.where}`, (error, results) => {
          if (error) throw new Error(error);
          resolve(results);
        });
      });
      } else {
        return new Promise(resolve => {
          this.connection.query(`select ${options.fields} from ${options.table}`, (error, results) => {
            if (error) throw new Error(error);
            resolve(results);
          });
        });
      }
    }

    insert (options) {
      if (typeof options !== "object") throw new Error(`The options must be of type "object" type received was ${typeof options}`);
      if (typeof options.table !== "string") throw new Error(`table must be of type "string" type received was ${typeof options.table}.`);
      if (typeof options.fields !== "string") throw new Error(`fields must be of type "string" type received was ${typeof options.fields}.`);
      if (typeof options.values !== "string") throw new Error(`values must be of type "string" type received was ${typeof options.values}.`);
        return new Promise(resolve => {
          this.connection.query(`insert into ${options.table} (${options.fields}) values (${options.values})`, (error, results) => {
            if (error) throw new Error(error);
            resolve(results);
          });
        });
    }
}


