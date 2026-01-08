const express = require("express");
const app= express();
const mongoose= require("mongoose");
const Listing= require("./models/listing.js");
const path= require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");

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

//Home Route
app.get("/",(req, res)=>{
    res.send("Hello, this is the root node");
});

//Index Route
app.get("/listings", async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{ allListings });

})

//New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//Create Route
app.post("/listings/create",async (req,res)=>{
    let newListing= new Listing(req.body.listing);
    newListing.save();
    res.redirect("/listings");
})

//Edit route
app.get("/listings/:id/edit", async (req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    res.render("listings/edit.ejs",{ listing });
});

//Update Route
app.put("/listings/:id", async (req,res)=>{
     let {id}= req.params;
     await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id",async (req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

//Show Route
app.get("/listings/:id", async (req,res)=>{

    let {id}= req.params;
    const listing= await Listing.findById(id);
    res.render("listings/show.ejs",{ listing });
});

app.listen(8080, ()=>{
    console.log("App listening on port 8080");
});
