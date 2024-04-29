// ? Imports
import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// ? Creating the video schema
const videoSchema =  new Schema({

  videoFile: {
    type: String, // Cloudinary url
    required: true
  },

  thumbnail: {
    type: String, // Cloudinary url
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },

  views: {
    type: Number,
    default: 0
  },

  isPublished: {
    type: Boolean,
    default: true
  },

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }

},{timestamps: true});

// ? Using the aggregate pipeline
videoSchema.plugin(mongooseAggregatePaginate);

// ? Exporting
export const Video = mongoose.model("Video", videoSchema);