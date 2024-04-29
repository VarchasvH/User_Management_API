// ? Imports
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'; // File system

// ? Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // * If there is no local file path
    if(!localFilePath) return null;

    // * Upload the file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })

    // * File is successfully uploaded
    console.log('File successfully uploaded', response.url);

    return response;
  } catch (error) {
    // * remove the temporary local saved file
    fs.unlinkSync(localFilePath);
    return null;
  }
}

export default uploadOnCloudinary;