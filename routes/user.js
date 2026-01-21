const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

//signup get route
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

//signup post route
router.post("/signup", wrapAsync(async (req, res, next) => {
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
}));

//login get route
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

//login post route
router.post("/login",
    saveRedirectUrl,
    passport.authenticate(
        "local",
        {
            failureRedirect: "/login",
            failureFlash: true
        }),
    async (req, res) => {
        req.flash("success", "Logged In successfully");
        let redirectUrl = res.locals.redirectUrl || "/listings";

        if (redirectUrl.includes("/reviews")) {
            return res.redirect("/listings");
        }
        res.redirect(redirectUrl);

    });

//logout route
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged Out Successfully");
        res.redirect("/listings");
    })
});

module.exports = router;
