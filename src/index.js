// ? Imports
import dotenv from 'dotenv';
import connectDB from "./db/connectDB.js";
import app from './app.js';

// ? Configuring our environment variables
dotenv.config({
  path: './env'
})

// ? Connecting to the database
connectDB().
// * if connected successfully
then(() => {
  // ! handling the error message
  app.on('error', (error) => {
    console.error(`Connection error :: ${error}`);
    throw error;
  })

  // * Listening to the port
  app.listen(process.env.PORT || 8000, () => {
  console.log(`The server is running on http://localhost:${process.env.PORT}`)
} )})

// ! Error handling
.catch((error) => {
  console.error(`MongoDB connection error :: ${error}`);
})
