const User = require("../models/user");

module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({
            username: username,
            email: email,
        });

        let savedUser = await User.register(newUser, password);
        req.login(savedUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "SignedUp Successfully");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Logged In successfully");
    let redirectUrl = res.locals.redirectUrl || "/listings";

    delete req.session.redirectUrl;

    if (redirectUrl.includes("/reviews")) {
        const parts = redirectUrl.split("/"); // ["", "listings", "64ac3f…", "reviews"]
        const listingId = parts[2];
        redirectUrl = `/listings/${listingId}`;
    }
    res.redirect(redirectUrl);

};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged Out Successfully");
        res.redirect("/");
    })
};