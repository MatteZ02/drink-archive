const db = require("../db");

module.exports = (app) => {
    const renderTemplate = (req, res, template, code) => {
        res.render(template, { db, code });
    };

    function random(length) {
        let result = '';
        if (!length) length = 6;
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10).toString();
        }
        return result;
    }

    app.get("/", (req, res) => {
        if (req.session.loggedin) {
            renderTemplate(req, res, "index");
        } else {
            res.redirect("/login");
        }
    });

    app.get("/login", (req, res) => renderTemplate(req, res, "login"));
    app.get("/register", (req, res) => renderTemplate(req, res, "register"))
    app.get("/drinks", (req, res) => renderTemplate(req, res, "drinks"));
    app.get("/adddrink", (req, res) => renderTemplate(req, res, "addDrink"));

    app.post("/registered", async (req, res) => {
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const password2 = req.body.password2;
        const results = await db.select({fields: "*", table: "accounts"});
        results.forEach(item => {
            if (item.email == email) {
                renderTemplate(req, res, "register", "EMAIL_INUSE");
                res.end();
            }
            if (item.username == username) {
                renderTemplate(req, res, "register", "USERNAME_INUSE");
                res.end();
            }
        });
        if (password !== password2) {
            renderTemplate(req, res, "register", "PASSWORD_NOT_MATCH");
            res.end();
        }
        if (username && password && password2 && email) {
            db.insert({table: "accounts", fields: 'id, username, password, email', values: `"${random(20)}", "${username}", "${password}", "${email}"`});
            renderTemplate(req, res, "login", "REGISTERED");
            res.end();
        } else {
            res.send('Please fill the requiered fields!');
            res.end();
        }
    });

    app.post('/auth', async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        if (username && password) {
           const results = await db.select({fields: "*", table: "accounts", where: "username = ? AND password = ?", username: username, password: password});
                if (results.length > 0) {
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.redirect('/');
                } else {
                    renderTemplate(req, res, "login", "INCORRECT_LOGIN_DETAILS");         
                }			
                res.end();
        } else {
            res.send('Please enter Username and Password!');
            res.end();
        }
    });
}