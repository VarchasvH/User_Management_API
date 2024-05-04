import mongoose, {Schema} from "mongoose";

/**
 * @description Subscription schema for the application
 * @type {Schema}
 */
const subscriptionSchema = new Schema({
  /**
   * @description Subscribing user
   * @type {ObjectId}
   * @ref User
   */
  subscriber: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  /**
   * @description Channel owner
   * @type {ObjectId}
   * @ref User
   */
  channel: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }

},
/**
   * @description Timestamps for creation and update
   * @type {Date}
   */
  {
    timestamps: true
  });

  /**
 * @description Subscription model for the application
 * @type {Model}
 */
  export const Subscription = mongoose.model('Subscription', subscriptionSchema);