import express from "express";
import config from "./config.json";
import database from "./database";

const app = express();
const db = new database();

const renderTemplate = (req, res, template) => {
    res.render(template, { db });
};

app.use(
    express.json({
      limit: "1mb",
    })
  );

app.listen(port, () => console.log(`- Active on port ${port} -`));
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");