import { Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profile: string;
}

export interface ITeam extends Document {
  creator: Types.ObjectId;
  name: string;
  profile?: string;

  description?: string;
  members: Types.DocumentArray<IUser>;
  todos: Types.DocumentArray<ITodo>;
}

export interface ITodo extends Document {
  content: string;
  status: "CREATED" | "TODO" | "IN PROGRESS" | "COMPLETED" | "APPROVED";
  team: Types.ObjectId;
  order: number;
  assignee: Types.ObjectId;
}
