import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({

  // ? Subscribing user
  subscriber: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // ? Channel owner
  channel: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }

},
  {
    timestamps: true
  });

  export const Subscription = mongoose.model('Subscription', subscriptionSchema);