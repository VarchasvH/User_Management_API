import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {

// ? connecting to the database using mongoose
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`\n MongoDB connected || DB Host:${connectionInstance.connection.host}`);
  }

// ! handling connection errors
  catch (error) {
    // ! logging the error
    console.error('Connection error :: ' + error);
    // ! exiting the process
    process.exit(1);
  }
}

export default connectDB;