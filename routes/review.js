//Review Route
const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");


//Review Route
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot review your own listing");
        return res.redirect(`/listings/${req.params.id}`);
    }
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", " Review added");
    res.redirect(`/listings/${req.params.id}`);
}));

//Review delete Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", " Review deleted");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;