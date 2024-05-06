import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ! register route
router.route('/register').post(
  // Middleware using multer
  upload.fields([
  {
    name: 'avatar',
    maxCount: 1
  }, {
    name: 'coverImage',
    maxCount: 1
  }
]), registerUser);

// ! login route
router.route('/login').post( loginUser ); //tested

// ! secured routes
router.route('/logout').post( verifyJWT, logoutUser ); // tested
router.route('/refresh-token').post( refreshAccessToken ); // tested
router.route('/change-password').post( verifyJWT ,changeCurrentPassword );
router.route('/current-user').get(verifyJWT, getCurrentUser); //tested
router.route('/update-account').patch(verifyJWT, updateAccountDetails); // tested
router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);
router.route('/c/:username').get(verifyJWT, getUserChannelProfile); // tested
router.route('/watch-history').get(verifyJWT, getWatchHistory); // tested

// ? Export
export default router;