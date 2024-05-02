import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler( async ( req, _, next ) => {

  try {
    // ? Get the cookies that we injected into the user upon login.
    const token = req.cookies?.accessToken || req.header('Authorization').replace('Bearer ',"");

    // ? Check if the token is valid or not
    if(!token) throw new ApiError(401, 'Unauthorized request');

    // ? If the token is valid, then we will decode it
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // ? If the token is valid, then we will check if the user exists or not.
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    // ? Throw an error if the user does not exist
    if(!user) throw new ApiError(401, 'Invalid Access Token');

    req.user = user;
    next();
  } catch (error) {
    console.log('Error while authenticating ::', error);
    throw new ApiError(401, error?.message || 'Invalid Access Token');
  }
})