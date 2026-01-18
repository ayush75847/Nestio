//Review Route
const express= require("express");
const router= express.Router({mergeParams: true});

const wrapAsync= require("../utils/wrapAsync");
const ExpressError= require("../utils/ExpressError.js");
const Listing= require("../models/listing.js");
const {reviewSchema}= require("../schema.js");
const Review= require("../models/review.js");

const validateReview= (req,res,next)=>{
    let{error}= reviewSchema.validate(req.body);
    if(error){
        const errMsg= error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//Review Route
router.post("/", validateReview, wrapAsync( async(req,res)=>{
    let listing= await Listing.findById(req.params.id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
     }
    let newReview= new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success"," Review added");

    res.redirect(`/listings/${req.params.id}`);
}));

//Review delete Route
router.delete("/:reviewId", wrapAsync( async(req,res)=>{
    let {id, reviewId}= req.params;

    await Listing.findByIdAndUpdate(id, {$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success"," Review deleted");
    res.redirect(`/listings/${id}`);
}));

module.exports= router;