//Review Route
const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController= require("../controllers/reviews.js");

//Review Route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.addReview));

//Review delete Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;