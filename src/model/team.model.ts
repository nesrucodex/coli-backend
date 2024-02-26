import mongoose, { Model, Document, Types } from "mongoose";
import { ITeam } from "../types/global";
const { Schema, model } = mongoose;

interface TeamMethods {}

interface TeamModel extends Model<ITeam, {}, TeamMethods> {}

const TeamSchema = new Schema<ITeam, TeamModel, TeamMethods>(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator for the team is required"],
    },
    name: {
      type: String,
      required: [true, "Group name is required"],
    },
    profile: String,

    description: String,
    members: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    todos: [{ type: Schema.Types.ObjectId, ref: "Todo", default: [] }],
  },
  { timestamps: true }
);

const Team = model("Team", TeamSchema);

export { Team };
