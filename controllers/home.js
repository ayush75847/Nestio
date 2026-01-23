const Listing = require("../models/listing");

module.exports.home= async (req,res)=>{
    let allListings= await Listing.find({});
    res.render("home/home.ejs", {allListings});
};