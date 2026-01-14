const express = require("express");
const app= express();
const mongoose= require("mongoose");
const Listing= require("./models/listing.js");
const path= require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const {listingSchema, reviewSchema}= require("./schema.js");
const Review= require("./models/review.js");

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

const MONGOOSE_URL="mongodb://127.0.0.1:27017/nestio";

main()
.then(()=>{
    console.log("MongoDB connected");
})
.catch((e)=>{
    console.log(e);
});

async function main() {
    await mongoose.connect(MONGOOSE_URL);
    
};

const validateListing= (req,res,next)=>{
    let{error}= listingSchema.validate(req.body);
    if(error){
        const errMsg= error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

const validateReview= (req,res,next)=>{
    let{error}= reviewSchema.validate(req.body);
    if(error){
        const errMsg= error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//Home Route
app.get("/",(req, res)=>{
    res.send("Hello, this is the root node");
});

//Index Route
app.get("/listings", wrapAsync( async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{ allListings });

}));

//New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//Create Route
app.post("/listings/create", validateListing, wrapAsync(async (req,res,next)=>{
    let newListing= new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//Edit route
app.get("/listings/:id/edit", wrapAsync( async (req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    res.render("listings/edit.ejs",{ listing });
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync( async (req,res)=>{
     let {id}= req.params;
     await Listing.findByIdAndUpdate(id, {...req.body.listing},{runValidators: true, runSettersOnQuery: true});
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync( async (req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//Review Route
app.post("/listings/:id/reviews", validateReview, wrapAsync( async(req,res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${req.params.id}`);
}));

//Review delete Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync( async(req,res)=>{
    let {id, reviewId}= req.params;

    await Listing.findByIdAndUpdate(id, {$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));

//Show Route
app.get("/listings/:id", wrapAsync( async (req,res)=>{

    let {id}= req.params;
    const listing= await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{ listing });
}));


// Middleware for non existing pages Error Handling 
app.use( (req,res,next)=>{
    next(new ExpressError(404,"Page not Found!"));
});

app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went incorrect"}= err;
    res.status(statusCode).render("listings/error.ejs",{message});
});

app.listen(8080, ()=>{
    console.log("App listening on port 8080");
});
