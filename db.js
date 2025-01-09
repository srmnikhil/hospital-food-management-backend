const mongoose = require("mongoose");
require('dotenv').config();
const mongoURI = process.env.DATABASE_URI;

const connectToMongo = () =>{
    mongoose.connect(mongoURI)
    .then(() =>{ 
        console.log("Connected to Mongo Successfully");
    })
    .catch((error) =>{
        console.log("Failed to Connect: "+(error));
    });
}
module.exports = connectToMongo;