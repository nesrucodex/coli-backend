import mongoose from "mongoose";
import { TODO_STATUS } from "../constants/global";
const { Schema, model } = mongoose;

const todoSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Content for todo is required"],
    },
    status: {
      type: String,
      enum: Object.values(TODO_STATUS),
      default: TODO_STATUS.CREATED,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Team for the todo is required"],
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    order: {
      type: Number,
      default: -1,
    },
  },
  { timestamps: true }
);

todoSchema.path("assignee").validate(function (assignee) {
  if (this.status === TODO_STATUS.TODO && !assignee) return false;

  return true;
}, "Assignee is required when the created todo is assigned to a member");

export const Todo = model("Todo", todoSchema);
