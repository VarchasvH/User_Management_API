import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';

const registerUser = asyncHandler( async (req, res) => {

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

export default registerUser;