import mongoose, { Schema } from "mongoose";
import { INotification } from "../types/global";
import { NOTIFICATION_TYPES } from "../constants/global";

const notificationSchema: Schema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required for notification"],
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Team is required for notification"],
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: [true, "Notification type is required"],
    },
    content: {
      type: String,
      required: [true, "Notification content is required"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
