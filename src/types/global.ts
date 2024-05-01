import { Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profile: string;
}

export type IMemberStatus = "MEMBER" | "PENDING" | "BLOCK";

export type INotificationTypes =
  | "MEMBER_REQUEST"
  | "TODO_COMMENT_ADDED"
  | "TEAM_CHAT_MESSAGE"
  | "TODO_STATUS_CHANGED"
  | "GENERAL";

export interface ITeam extends Document {
  creator: Types.ObjectId;
  name: string;
  profile?: string;

  description?: string;
  members: {
    user: Types.ObjectId;
    todos: Types.DocumentArray<ITodo>;
    status: IMemberStatus;
  }[];
  unassignedTodos: Types.DocumentArray<ITodo>;
}

export interface ITodo extends Document {
  content: string;
  status: "CREATED" | "TODO" | "IN PROGRESS" | "COMPLETED" | "APPROVED";
  team: Types.ObjectId;
  order: number;
  assignee: Types.ObjectId;
}

export interface IComment extends Document {
  content: string;
  sender: Types.ObjectId;
  todo: Types.ObjectId;
  team: Types.ObjectId;
  seenBy: Types.DocumentArray<IUser>;
  reply?: Types.ObjectId;
}

export interface INotification extends Document {
  recipient: Types.ObjectId;
  team: Types.ObjectId;
  type: string; // Type of notification: 'team_request', 'todo_comment', 'team_chat', 'todo_status_change'
  content: string;
  read: boolean;
  createdAt: Date;
}
