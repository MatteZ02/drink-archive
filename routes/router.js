const db = require("../db");

module.exports = (app) => {
    const renderTemplate = (req, res, template, code) => {
        res.render(template, { db, code, user: req.session.user });
    };

    const isAuthenticated = (req, res, template) => {
        if (req.session.loggedin) {
            renderTemplate(req, res, template);
        } else {
            res.redirect("/login");
        }
    }

    const isAuthenticatedInv = (req, res, template) => {
        if (!req.session.loggedin) {
            renderTemplate(req, res, template);
        } else {
            res.redirect("/");
        }
    }

    app.get("/", (req, res) => isAuthenticated(req, res, "index"));

    app.get("/login", (req, res) => isAuthenticatedInv(req, res, "login"));
    app.get("/register", (req, res) => isAuthenticatedInv(req, res, "register"));
    app.get("/drinks", (req, res) => isAuthenticated(req, res, "drinks"));
    app.get("/add", (req, res) => isAuthenticated(req, res, "add"));
    app.get("/user", (req, res) => isAuthenticated(req, res, "user"));

    app.get("/logout", (req, res) => {
        req.session.loggedin = false;
        res.redirect("/");
    });

    app.post("/registered", async (req, res) => {
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const password2 = req.body.password2;
        const results = await db.select({fields: "*", table: "accounts"});
        let inUse = false;
        results.forEach(item => {
            if (item.email.toLowerCase() == email.toLowerCase()) {
                if (inUse) return;
                inUse = true;
                return renderTemplate(req, res, "register", "EMAIL_INUSE");
            } else if (item.username.toLowerCase() == username.toLowerCase()) {
                if (inUse) return;
                inUse = true;
                return renderTemplate(req, res, "register", "USERNAME_INUSE");
            }
        });
        if (inUse) return;
        if (password !== password2) {
            return renderTemplate(req, res, "register", "PASSWORD_NOT_MATCH");
        }
        if (username && password && password2 && email) {
            db.insert({table: "accounts", fields: 'username, password, email, admin', values: `"${username}", "${password}", "${email}, 0"`});
            return renderTemplate(req, res, "login", "REGISTERED");
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
                    req.session.user = results;
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