const db = require("../db");

module.exports = (app) => {
    const renderTemplate = (req, res, template, params, code) => {
        const user = req.session.user || [];
        res.render(template, { db, params, code, user: user[0]});
    };

    const isAuthenticated = (req, res, template, params) => {
        if (req.session.loggedin) {
            renderTemplate(req, res, template, params);
        } else {
            res.redirect("/login");
        }
    }

    const isAuthenticatedInv = (req, res, template, params) => {
        if (!req.session.loggedin) {
            renderTemplate(req, res, template, params);
        } else {
            res.redirect("/");
        }
    }

    app.get("/", (req, res) => isAuthenticated(req, res, "index"));

    app.get("/login", (req, res) => isAuthenticatedInv(req, res, "login"));
    app.get("/register", (req, res) => isAuthenticatedInv(req, res, "register"));
    app.get("/drinks", async (req, res) => isAuthenticated(req, res, "drinks", { drinks: await db.select({table: "drinks"}) }));
    app.get("/add", async (req, res) => isAuthenticated(req, res, "add", { ingredients: await db.select({table: "ingredient"}) }));
    app.get("/user", (req, res) => isAuthenticated(req, res, "user"));

    app.get("/drink/:drinkID", async (req, res) => {
        const id = req.params.drinkID;
        const drink = await db.select({table: "drinks", where: `id = ${id}`});
        isAuthenticated(req, res, "drink", { id, drink: drink[0] });
    });

    app.get("/logout", (req, res) => {
        req.session.loggedin = false;
        res.redirect("/");
    });

    app.post("/registered", async (req, res) => {
        const results = await db.select({table: "accounts"});
        let inUse = false;
        results.forEach(item => {
            if (item.email.toLowerCase() == req.body.email.toLowerCase()) {
                if (inUse) return;
                inUse = true;
                return renderTemplate(req, res, "register", {}, "EMAIL_INUSE");
            } else if (item.username.toLowerCase() == req.body.username.toLowerCase()) {
                if (inUse) return;
                inUse = true;
                return renderTemplate(req, res, "register", {}, "USERNAME_INUSE");
            }
        });
        if (inUse) return;
        if (req.body.password !== req.body.password2) {
            return renderTemplate(req, res, "register", {}, "PASSWORD_NOT_MATCH");
        }
        if (req.body.username && req.body.password && req.body.password2 && req.body.email) {
            db.insert({table: "accounts", fields: "username, password, email, admin", values: `"${req.body.username}", "${req.body.password}", "${req.body.email}", "0"`});
            return renderTemplate(req, res, "login", {}, "REGISTERED");
        } else {
            res.send('Please fill the requiered fields!');
            res.end();
        }
    });

    app.post("/auth", async (req, res) => {
        if (req.body.username && req.body.password) {
           const results = await db.select({table: "accounts", where: "username = ? AND password = ?", username: req.body.username, password: req.body.password});
                if (results.length > 0) {
                    if (results.admin == 1) results.admin = true;
                    else results.admin = false;
                    req.session.loggedin = true;
                    req.session.user = results;
                    res.redirect('/');
                } else {
                    renderTemplate(req, res, "login", {}, "INCORRECT_LOGIN_DETAILS");         
                }			
                res.end();
        } else {
            res.send('Please enter Username and Password!');
            res.end();
        }
    });

    app.post("/add", async (req, res) => {
        const result = await db.insert({table: "drinks", fields: "name, genre, recipe, approved", values: `"${req.body.name}", "${req.body.genre}", "${req.body.recipe}", "0"`});
        let i = 0;
        req.body.ingredients.forEach(item => {
            if (item == 1) return;
            db.insert({table: "ingredients", fields: "drink, ingredient, amount", values: `"${result.insertId}", "${item}", "${req.body.amount[i]}"`});
            i++;
        });
        res.redirect(`/drink/${result.insertId}`);
    });

    app.post("/addingredient", (req, res) => {
        db.insert({table: "ingredient", fields: "name", values: `"${req.body.name}"`});
        res.redirect("/add");
    });
}