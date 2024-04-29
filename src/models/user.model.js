// ? Imports
import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ? Creating the user schema
const userSchema = new Schema({

  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Username can not be more than 50 characters'],
    index: true
  },

  email: {
    type: String,
    required: [true, 'Please provide a email address'],
    unique: true,
    trim: true,
    lowercase: true,
  },

  fullName: {
    type: String,
    required: [true, 'Please provide your Full name'],
    trim: true,
    index: true
  },

  avatar: {
    type: String, // we will use cloudinary
    required: true,

  },

  coverImage: {
    type: String, // we will use cloudinary
  },

  watchHistory: [
    {
    type: Schema.Types.ObjectId,
    ref: 'Video'
    }
  ],

  password: {
    type: String,
    required: [true, 'Please provide a password']
  },

  refreshToken: {
    type: String
  }
}, {timestamps: true})

// ? Just before we save the changes to user password, we will encrypt the password
userSchema.pre('save', async function (next){
  // * Check to make sure we only encrypt the password when it's modified
  if(!this.isModified("password")) return;

  // * Encrypting the password
  this.password = bcrypt.hash(this.password, 10);
  next();
});

// ? Creating custom methods inside our schema
 // * To check if the password is correct
userSchema.methods.isPasswordCorrect = async function(){
  return await bcrypt.compare(password, this.password);
};

 // * To create a access and a refresh token
userSchema.methods.generateAccessToken = async function(){
  return jwt.sign(
    // ? Payload / Data
    {
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName,
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  }
)};
userSchema.methods.generateRefreshToken = async function(){
  return jwt.sign(
    // ? Payload / Data
    {
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName,
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  }
)
};

// ? Exporting
export const User = mongoose.model('User', userSchema);