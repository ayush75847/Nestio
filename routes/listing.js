const express= require("express");
const router= express.Router();
const wrapAsync= require("../utils/wrapAsync");
const {isLoggedIn, validateListing, isOwner}= require("../middleware.js");
const listingController= require("../controllers/listings.js");
const multer  = require('multer');
const {storage}= require("../cloudConfig.js");
const upload = multer({storage});


//Index Route
router.get("/", wrapAsync(listingController.index ));

//New Route
router.get("/new", isLoggedIn, listingController.newListing);

//Create Route
 router.post("/", isLoggedIn, validateListing, upload.single("listing[image]"), wrapAsync(listingController.createNew));

//Edit route
router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(listingController.editListing ));

//router route for common paths
router.route("/:id")

//Update Route
.put(isLoggedIn, isOwner, validateListing, upload.single("listing[image]"), wrapAsync( listingController.updateListing))

//Delete Route
.delete(isLoggedIn, isOwner, wrapAsync( listingController.deleteListing))

//Show Route
.get(wrapAsync( listingController.showListing));

module.exports= router;