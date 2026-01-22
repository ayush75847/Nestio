const mongoose = require("mongoose");
const Review = require("./review.js");
const { required } = require("joi");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },

    description: String,
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://imgs.search.brave.com/x6uHDei63r2U35HbRncFplw4LXWp_kJI2hhbSbglp9A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMjA2/MzU5L3BleGVscy1w/aG90by0yMDYzNTku/anBlZz9hdXRvPWNv/bXByZXNzJmNzPXRp/bnlzcmdiJmRwcj0x/Jnc9NTAw",
            set: v => {
                if (!v || v.trim() === "") {
                    return "https://imgs.search.brave.com/x6uHDei63r2U35HbRncFplw4LXWp_kJI2hhbSbglp9A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMjA2/MzU5L3BleGVscy1w/aG90by0yMDYzNTku/anBlZz9hdXRvPWNv/bXByZXNzJmNzPXRp/bnlzcmdiJmRwcj0x/Jnc9NTAw";
                }
                return v;
            }
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review",
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number],
            required:  true
        }
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;