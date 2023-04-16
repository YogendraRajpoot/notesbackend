const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.URL;

const connectToMongo = async () => {
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log("mongo connect=========>", conn.connection.host);
  } catch (error) {
    console.log("error============>", error);
  }
};

module.exports = connectToMongo;
