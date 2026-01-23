const Listing = require("../models/listing.js");
const axios = require("axios");

module.exports.index = async (req, res) => {
    const search = req.query.search?.trim();
    let listings = [];

    if (search) {
        listings = await Listing.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } },
            ],
        });
    } else {
        listings = await Listing.find({});
    }

    res.render("listings/index.ejs", { listings, search });
};


module.exports.newListing = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createNew = async (req, res, next) => {
    const { location, country } = req.body.listing;

    // 1️⃣ Get coordinates from Nominatim
    const query = encodeURIComponent(`${location}, ${country}`);
    const geoURL = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    let lat = 0, lng = 0;

    try {
        const geoResp = await axios.get(geoURL, {
            headers: { "User-Agent": "NestioApp" }
        });

        if (geoResp.data.length) {
            lat = parseFloat(geoResp.data[0].lat);
            lng = parseFloat(geoResp.data[0].lon);
        } else {
            console.log("No coordinates found for this location");
        }

        console.log("Coordinates found:", lat, lng);

    } catch (err) {
        console.error("Geocoding error:", err);
    }

    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.geometry = {
        type: "Point",
        coordinates: [lng, lat]
    };
    if (req.file) {
        newListing.image = {
            filename: req.file.filename,
            url: req.file.path
        };
    };
    await newListing.save();
    req.flash("success", " New listing created");
    res.redirect(`/listings/${newListing._id}`);
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    let changeImageUrl = originalImageUrl.replace("/upload", "/upload/h_100,w_200");
    res.render("listings/edit.ejs", { listing, changeImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        {
            runValidators: true,
            runSettersOnQuery: true,
            new: true
        });
    if (req.file) {
        listing.image = {
            filename: req.file.filename,
            url: req.file.path
        };
    };
    await listing.save();

    req.flash("success", " Listing updated");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", " Listing Deleted");
    res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {

    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        }
    })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};