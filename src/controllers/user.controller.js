import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * @description Generates a new access token and refresh token for the given user.
 * @memberof UserController
 * @param {string} userId - The ID of the user for whom the tokens need to be generated.
 * @returns {object} An object containing the newly generated access token and refresh token.
 * @throws {ApiError} If the tokens were unable to be generated.
 */
const generateAccessAndRefreshToken = async(userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken()
    const accessToken = user.generateAccessToken()

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }

  catch (error) {
    console.log('Error ::', error);
    throw new ApiError(500, 'Refresh Token and Access Token were unable to be generated')
  };
};

/**
 * @description Registers a new user.
 * @memberof UserController
 * @route POST /api/v1/users/register
 * @param {string} fullName - The full name of the user.
 * @param {string} username - The username of the user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @returns {object} A JSON object containing the newly registered user's details.
 * @throws {ApiError} If the user already exists, or if any of the required fields are empty.
 */
const registerUser = asyncHandler( async (req, res) => {

/*
TODO Algorithm behind registering functionality:
  * 1. Get the data from the user - Get details from the frontend.
  * 2. Data validation - Not empty.
  * 3. Check if the user already exists or not - Username and email.
  * 4. Check avatar image and cover image through MULTER.
  * 5. Upload avatar and coverImage to cloudinary and get the reference.
  * 6. Create a new object - Create entry in DB.
  * 7. Look for the user by using the newly formed id and remove password and refresh token from it.
  * 8. Return the response.
*/

// ! Get the data from the user - Get details from the frontend
  const {fullName, username, email, password} = req.body;

// ! Data validation - Not empty
  if([fullName, username, email, password].some((fields) => fields?.trim() === '')){
    throw new ApiError(400, 'Please fill in all required fields')
  }

// ! Check if the user already exists or not - Username and email
const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

// ! Check avatar image and cover image through MULTER
  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

  if(!avatarLocalPath) throw new ApiError(400, 'Avatar not found');

// ! Upload avatar and coverImage to cloudinary and get the reference
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if(!avatar) throw new ApiError(400, 'Avatar not found');

// ! Create a new object - Create entry in DB
  const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email,
      password,
      avatar: avatar.url,
      coverImage: coverImage?.url || ""
    });

    // ? Check if the user was created or not
    const createdUser = await User.findById(user._id)
// ! If there is a response, Remove password and refresh token field from response
    .select(
      "-password -refreshToken"
    );

    if(!createdUser) throw new ApiError(500, 'Something went wrong while registering user');

// ! Return the response
    return res.status(201).json(
      new ApiResponse(200, createdUser, 'User registered successfully')
    )

});

/**
 * @description Logs in an existing user.
 * @memberof UserController
 * @route POST /api/v1/users/login
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @returns {object} A JSON web token representing the logged-in user.
 * @throws {ApiError} If the user does not exist, or if the password is incorrect.
 */
const loginUser = asyncHandler(async (req, res) => {
/*
TODO - The logic behind the login functionality
  * 1. Get the details of user from the body.
  * 2. All the fields must be filled to login.
  * 3. Using the username or the email search for the user in the database.
  * 4. Check password
  * 5. Generate Access and Refresh token.
  * 6. Send cookies and sucess message.
*/

  // ! Get the details of user from the body.
  const {username, email, password} = req.body;

  // ! All the fields must be filled to login.
  if(!(username || email)){
    throw new ApiError(400, 'Username or Email must be provided');
  };

  // ! Using the username or the email search for the user in the database.
  const user = await User.findOne({
    $or: [{username} ,{email}]
  });

  // ? If we don't find the user
  if(!user) throw new ApiError(404, 'User does not exist');

  // ! Check password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if(!isPasswordValid) throw new ApiError(401, 'Password incorrect');

  // ! Generate Access and Refresh token.
  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedinUser = await User.findById(user._id)
  .select(" -refreshToken -password");

  // ! Send cookies
  const options = {
    httpOnly: true, // anyone from the frontend can modify cookies.
    secure: true // only the server can modify cookies. Both are require for security
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {user: loggedinUser, accessToken, refreshToken},
      'User logged in successfully')
  )
});

/**
 * @description Logs out an existing user.
 * @memberof UserController
 * @route POST /api/v1/users/logout
 * @param {string} refreshToken - The refresh token of the user.
 * @returns {object} A JSON object containing a success message.
 * @throws {ApiError} If the user does not exist, or if the refreshToken is invalid.
 */
const logoutUser = asyncHandler(async (req, res) => {
/*
TODO Logic behind logout functionality
  * 1. Clear the refreshToken.
  * 2. Clear all the cookies.
*/

// ! Clear the refreshToken.
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie('accessToken', options)
  .clearCookie('refreshToken', options)
  .json(
    new ApiResponse(
      200,
      {},
      'User logged out successfully'
    )
  );

});

/**
 * @description Refreshes the access token for the given user.
 * @memberof UserController.
 * @route POST /api/v1/users/refresh-token
 * @param {string} refreshToken - The refresh token of the user.
 * @returns {object} An object containing the newly generated access token and refresh token.
 * @throws {ApiError} If the refresh token is invalid or expired.
*/
const refreshAccessToken = asyncHandler(async(req, res) => {
/*
TODO Logic behind refreshing the access token
  * 1. Get the refreshToken from the cookies.
  * 2. Check if the refreshToken is valid or not.
  * 3. Generate Access and Refresh token
*/

  // ! Get the refreshToken from the cookies.
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    // ? If there is no refresh token
  if(!incomingRefreshToken) throw new ApiError(401, 'Unauthorized Request');

  // ! Check if the refreshToken is valid or not.
    // ? Verifying the refreshtoken and decoding it
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    )
    const user = await User.findById(decodedToken._id);
      // ? If there is no user in DB with that token
    if(!user) throw new ApiError(401, 'Invalid refresh token');
    if(incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, 'Refresh token has expired or is already in use');

    // ! Generate Access and Refresh token.
    const options = {
      httpOnly: true,
      secure: true
    }
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);

    // ! Return response
    return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {accessToken, newRefreshToken },
        'Access token refreshed'
      )
    )
  } catch (error) {
    console.log('Error',error);
    throw new ApiError(401, error?.message || 'Invalid refresh token')
  }
});

/**
 * @description Changes the current password of the logged-in user.
 * @memberof UserController
 * @route PUT /api/v1/users/change-password
 * @param {string} oldPassword - The old password of the user.
 * @param {string} newPassword - The new password of the user.
 * @returns {object} A JSON object containing a success message.
 * @throws {ApiError} If the old password is incorrect or if there is an error updating the password.
*/
const changeCurrentPassword = asyncHandler( async ( req, res ) => {

  const {oldPassword, newPassword} = req.body;

  const user = await User.findById(req.user?._id); // ? auth.middleware

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if(!isPasswordCorrect) throw new ApiError(400, 'Invalid old password');

  user.password = newPassword;

  await user.save({validateBeforeSave: false});

  return res
  .status(200)
  .json(
    new ApiResponse(200, {},'Password updated successfully')
  );
});

/**
 * @description Fetches the current logged-in user.
 * @memberof UserController
 * @route GET /api/v1/users/current-user
 * @returns {object} A JSON object containing the current logged-in user's details.
 * @throws {ApiError} If the user does not exist.
 */
const getCurrentUser = asyncHandler(async ( req, res ) => {
  return res
  .status(200)
  .json(200, req.user, 'Current user fetched successfully')
});

/**
 * @description Updates the account details of the logged-in user.
 * @memberof UserController
 * @route PUT /api/v1/users/update-account-details
 * @param {string} fullName - The new full name of the user.
 * @param {string} email - The new email of the user.
 * @returns {object} A JSON object containing the updated user's details.
 * @throws {ApiError} If the user does not exist, or if any of the required fields are empty.
 */
const updateAccountDetails = asyncHandler(async ( req, res ) => {
  const {fullName, email} = req.body;

  if(!fullName || !email) {
    throw new ApiError(400, 'Full name and email must be provided');
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email
      }
    },
    {new: true}
  ).select('-password');

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, 'Account details updated successfully')
  )
});

/**
 * @description Updates the user's avatar.
 * @memberof UserController
 * @route PUT /api/v1/users/update-user-avatar
 * @param {string} avatarFile - The path to the new avatar file.
 * @returns {object} A JSON object containing the updated user's details.
 * @throws {ApiError} If the user does not exist, or if any of the required fields are empty.
 */
const updateUserAvatar = asyncHandler(async(req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is missing')
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if(!avatar.url){
    throw new ApiError(500, 'Error uploading avatar to cloudinary')
  }

  const user = await User.findByIdAndUpdate(
    request.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    { new: true }
  ).select('-password')

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, 'Avatar updated successfully')
  )
});

/**
 * @description Updates the user's cover image.
 * @memberof UserController
 * @route PUT /api/v1/users/update-user-cover-image
 * @param {string} coverImageFile - The path to the new cover image file.
 * @returns {object} A JSON object containing the updated user's details.
 * @throws {ApiError} If the user does not exist, or if any of the required fields are empty.
 */
const updateUserCoverImage = asyncHandler(async(req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, 'Cover image is missing')
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!coverImage.url){
    throw new ApiError(500, 'Error uploading cover image to cloudinary')
  }

  const user = await User.findByIdAndUpdate(
    request.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    { new: true }
  ).select('-password')

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, 'Cover image updated successfully')
  )
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};