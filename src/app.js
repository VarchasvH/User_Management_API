// ? Imports
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { SIZE_LIMIT } from './constants.js';

// ? creating the express application
const app = express();

// ?  Express configuration starts

// * ! Setting CORS configuration
app.use(cors({

// * giving the origin for the request
  origin: process.env.CORS_ORIGIN,

// * to allow credentials
  credentials: true
}));
// * Setting JSON configs and setting up a limit on json data size
app.use(express.json({limit: SIZE_LIMIT}));
// * URL encoding and setting up a limit on data size
app.use(express.urlencoded({extended: true,limit: SIZE_LIMIT}));
// * Creating a public folder
app.use(express.static('public'));

// * Configuring such that we can perform CRUD operations on the cookies
app.use(cookieParser());

// ? exporting
export default app;

