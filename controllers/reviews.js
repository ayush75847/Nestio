const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.addReview= async (req, res) => {
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
    if (!newReview.comment || newReview.comment.trim().length < 5) {
        req.flash("error", "Comment should be at least 5 characters long");
        return res.redirect(`/listings/${req.params.id}`);
    }
    
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", " Review added");
    res.redirect(`/listings/${req.params.id}`);
};

module.exports.deleteReview= async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", " Review deleted");
    res.redirect(`/listings/${id}`);
};