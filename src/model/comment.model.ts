import mongoose from "mongoose";
import { IComment } from "../types/global";
const { Schema, model } = mongoose;

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, "Content for comment is required"],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User for the comment is required"],
    },

    todo: {
      type: Schema.Types.ObjectId,
      ref: "Todo",
      required: [true, "Todo for the comment is required"],
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Team for the comment is required"],
    },

    seenBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    reply: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  { timestamps: true }
);

export const Comment = model("Comment", commentSchema);
