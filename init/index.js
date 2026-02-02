if(process.env.NODE_ENV != "production"){
    require('dotenv').config({ path: '../.env' });
}

const mongoose = require("mongoose");
const axios = require("axios");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGOOSE_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/nestio";

main()
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.log(e));

async function main() {
  await mongoose.connect(MONGOOSE_URL);
}

// Function to initialize DB with geometry
const initDB = async () => {
  await Listing.deleteMany({});
  console.log("Old listings cleared.");

  const listingsWithGeometry = [];

  for (let obj of initData.data) {
    const query = encodeURIComponent(`${obj.location}, ${obj.country}`);
    const geoURL = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    let geometry = {
      type: "Point",
      coordinates: [0, 0], // default in case geocoding fails
    };

    try {
      const geoResp = await axios.get(geoURL, {
        headers: { "User-Agent": "NestioApp" },
      });

      if (geoResp.data.length) {
        const lat = parseFloat(geoResp.data[0].lat);
        const lng = parseFloat(geoResp.data[0].lon);
        geometry.coordinates = [lng, lat];
      } else {
        console.log(` No coordinates found for ${obj.location}, ${obj.country}`);
      }
    } catch (err) {
      console.error(` Geocoding error for ${obj.location}:`, err.message);
    }

    listingsWithGeometry.push({
      ...obj,
      owner: "69807045bf475a83365f0c9c", // default owner
      geometry,
    });
  }

  await Listing.insertMany(listingsWithGeometry);
  console.log("✅ Data initialized with geometry!");
};

// Run initialization
initDB();
  
