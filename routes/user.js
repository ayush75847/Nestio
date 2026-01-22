const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router.route("/signup")
    //signup get route
    .get(userController.renderSignup)

    //signup post route
    .post(wrapAsync(userController.signup));

router.route("/login")

    //login get route
    .get(userController.renderLogin)

    //login post route
    .post(saveRedirectUrl,
        passport.authenticate(
            "local",
            {
                failureRedirect: "/login",
                failureFlash: true
            }),
        userController.login);

//logout route
router.get("/logout", userController.logout);

module.exports = router;
