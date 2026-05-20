const Listing = require("../models/listing.js");
const axios = require("axios");
const { cloudinary } = require("../cloudConfig");

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

  // Get coordinates from OpenCage
  const query = encodeURIComponent(`${location}, ${country}`);

  const geoURL = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${process.env.OPENCAGE_API_KEY}`;

  let lat = 0,
    lng = 0;

  try {
    const geoResp = await axios.get(geoURL);

    if (geoResp.data.results.length > 0) {
      lat = geoResp.data.results[0].geometry.lat;
      lng = geoResp.data.results[0].geometry.lng;
    } else {
      console.log("No coordinates found");
    }
  } catch (err) {
    console.error("Geocoding error:", err.message);
  }

  let newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;

  newListing.geometry = {
    type: "Point",
    coordinates: [lng, lat],
  };

  if (req.file) {
    newListing.image = {
      filename: req.file.filename,
      url: req.file.path,
    };
  }

  await newListing.save();

  req.flash("success", "New listing created");

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
  let changeImageUrl = originalImageUrl.replace(
    "/upload",
    "/upload/h_100,w_200",
  );
  res.render("listings/edit.ejs", { listing, changeImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const { location, country } = req.body.listing;

  const oldLocation = listing.location;
  const oldCountry = listing.country;

  listing.set(req.body.listing);

  if (
    location.trim().toLowerCase() !== oldLocation?.trim().toLowerCase() ||
    country.trim().toLowerCase() !== oldCountry?.trim().toLowerCase()
  ) {
    try {
      const query = encodeURIComponent(`${location}, ${country}`);
      const geoURL = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${process.env.OPENCAGE_API_KEY}`;
      const geoResp = await axios.get(geoURL);
      if (geoResp.data.results.length > 0) {
        const { lat, lng } = geoResp.data.results[0].geometry;
        listing.geometry = {
          type: "Point",
          coordinates: [lng, lat],
        };
      }
    } catch (err) {
      console.error("Geocoding error on update:", err.message);
    }
  }

  if (req.file) {
    try {
      if (listing.image?.filename) {
        await cloudinary.uploader.destroy(listing.image.filename);
      }
    } catch (err) {
      console.error("Cloudinary deletion failed:", err);
    }
    listing.image = { filename: req.file.filename, url: req.file.path };
  }

  await listing.save();
  req.flash("success", "Listing updated");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  try {
    if (listing.image && listing.image.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }
  } catch (err) {
    console.error("Cloudinary deletion failed:", err);
  }
  await Listing.findByIdAndDelete(id);
  req.flash("success", " Listing Deleted");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};
