const Listing= require("./models/listing");
const Review= require("./models/review.js");
const ExpressError= require("./utils/ExpressError.js");
const {listingSchema, reviewSchema}= require("./schema.js");

module.exports.isLoggedIn= (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl= req.originalUrl;
        req.flash("error","Please Login First");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl= (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl= req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner= async (req,res,next)=>{
    let {id}= req.params;
    let listing= await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
     }
    if(!req.user || req.user._id.toString() !== listing.owner._id.toString()){
        req.flash("error","Only owners can edit and delete");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing= (req,res,next)=>{
    let{error}= listingSchema.validate(req.body);
    if(error){
        const errMsg= error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.validateReview= (req,res,next)=>{
    let{error}= reviewSchema.validate(req.body);
    if(error){
        const errMsg= error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor= async (req,res,next)=>{
    let{id, reviewId}= req.params;
    let review= await Review.findById(reviewId);
    if(!review){
        req.flash("error","Review not found");
        return res.redirect(`/listings/${id}`);
    }
    if(!req.user || review.author._id.toString() !== req.user._id.toString()){
        req.flash("error","Only Review author can delete this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}