import { Request, Response } from "express";
import asyncWrapper from "../middleware/asyncWrapper";
import { StatusCodes } from "http-status-codes";
import { Comment } from "../model/comment.model";
import { IComment, ITeam, ITodo } from "../types/react-global";
import { Team } from "../model/team.model";
import BadRequest from "../errors/BadRequest";
import { MEMBER_STATUS, NOTIFICATION_TYPES } from "../constants/global";
import { Notification } from "../model/notification.model";
import { Todo } from "../model/todo.model";
import User from "../model/user.model";

export const createCommentController = asyncWrapper(
  async (req: Request, res: Response) => {
    const { content, sender, todoId, teamId, reply } = req.body;
    const team = await Team.findById(teamId)
      .populate({
        path: "creator",
        select: "name",
      })
      .populate({
        path: "members",
        select: "status",
        populate: { path: "user", select: "name" },
      });

    const todo = (await Todo.findById(todoId)) as ITodo;

    if (!team) throw new BadRequest("Team id is invalid");
    if (!todo) throw new BadRequest("Todo id is invalid");
    const comment = (await Comment.create({
      content,
      sender,
      todo: todoId,
      team: teamId,
      seenBy: [sender],
      reply: reply || null,
    })) as unknown as IComment;

    const response = (await Comment.findById(comment._id)
      .populate("sender", "name email profile")
      .populate("todo", "content")
      .populate("team", "name profile")
      .populate({
        path: "seenBy",
        select: "name email profile",
      })
      .populate({
        path: "reply",
        populate: { path: "sender", select: "name email profile" },
      })) as IComment;

    const assigneeId = team.members.find((mem) =>
      mem.todos.some((td) => td._id.toString() === todo._id.toString())
    )?.user._id;

    let assignee: any;
    if (assigneeId) assignee = await User.findById(assigneeId);

    // ! Requested Member Notification
    // ! Creator
    if (team.creator._id.toString() !== sender)
      await Notification.create({
        recipient: team.creator._id,
        team: team._id,
        type: NOTIFICATION_TYPES.GENERAL,
        content: `${response.sender.name} commented on ${assignee?.name} todo's in your ${team.name} team.`,
      });

    const notis = await Promise.all(
      team.members
        .filter((mem) => mem.status === MEMBER_STATUS.MEMBER)
        .map(async (mem) => {
          if (mem.user._id.toString() !== sender)
            await Notification.create({
              recipient: mem.user._id,
              team: team._id,
              type: NOTIFICATION_TYPES.GENERAL,
              content: `${response.sender.name} commented on ${assignee?.name} todo's in the ${team.name} team.`,
            });
        })
    );

    console.log("🚀 ~ notis:", notis);

    return res.status(StatusCodes.CREATED).json({
      status: "success",
      message: `comment created`,
      data: {
        comment: response,
      },
    });
  }
);
export const getTeamCommentsController = asyncWrapper(
  async (req: Request, res: Response) => {
    const { teamId } = req.params;

    const comments = (await Comment.find({ team: teamId })
      .populate("sender", "name email profile")
      .populate("todo", "content")
      .populate("team", "name profile")
      .populate({
        path: "seenBy",
        select: "name email profile",
      })
      .populate({
        path: "reply",
        populate: { path: "sender", select: "name email profile" },
      })) as unknown as IComment[] & { team: ITeam }[];

    return res.status(StatusCodes.CREATED).json({
      status: "success",
      message:
        comments.length > 0
          ? `${comments[0].team.name} comments`
          : "comments are empty",
      data: {
        comments,
      },
    });
  }
);
