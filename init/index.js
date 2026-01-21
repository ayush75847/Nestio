const mongoose= require("mongoose");
const initData= require("./data.js");
const Listing = require("../models/listing.js");

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

const initDB= async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner:"696f22efbc0e8c38755ae182"}));
    await Listing.insertMany(initData.data);

    console.log("Data initialized");
}

initDB();

