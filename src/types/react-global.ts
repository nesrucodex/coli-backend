export enum ASYNC_STATE {
  IDEL,
  LOADING,
  SUCCESS,
  ERROR,
  REDIRECT,
}

export interface IComment {
  _id: string;
  sender: IUser;
  todo: ITodo;
  team: ITeam;
  content: string;
  reply?: IComment;
  createdAt: Date;
}

export interface ITodo {
  _id: string;
  content: string;
  status: string;
  assignee?: IUser;
  createdAt: Date;
}
export interface IUser {
  _id: string;
  name: string;
  email: string;
  profile: string;
}

export type IMemberStatus = "MEMBER" | "PENDING" | "BLOCK";

export type INotificationTypes =
  | "MEMBER_REQUEST"
  | "TODO_COMMENT_ADDED"
  | "TEAM_CHAT_MESSAGE"
  | "TODO_STATUS_CHANGED"
  | "GENERAL";

export interface ITeam {
  _id: string;
  creator: IUser;
  name: string;
  profile?: string;
  description?: string;
  members: {
    user: IUser;
    todos: ITodo[];
    status: IMemberStatus;
  }[];
  unassignedTodos: ITodo[];
}

export interface INotification {
  _id: string;
  recipient: IUser;
  team: ITeam;
  type: string; // Type of notification: 'team_request', 'todo_comment', 'team_chat', 'todo_status_change'
  content: string;
  read: boolean;
  createdAt: string;
}
