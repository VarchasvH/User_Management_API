// Imports
import dotenv from 'dotenv';
import connectDB from "./db/connectDB.js";

// Configuring our environment variables
dotenv.config({
  path: './env'
})

// Connecting to the database
connectDB();