import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncWrapper from "../middleware/asyncWrapper";
import { Team } from "../model/team.model";
import BadRequest from "../errors/BadRequest";
import { Types } from "mongoose";
import { IUser } from "../types/global";
import { Todo } from "../model/todo.model";

export const getTeams = asyncWrapper(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const teams = await Team.find({
    $or: [{ creator: userId }, { members: { $in: [userId] } }],
  })
    .populate("creator", "name email profile")
    .populate("members", "name email profile");

  if (!teams) throw new BadRequest("Invalid team request");

  return res.status(StatusCodes.OK).json({
    status: "success",
    message: `${req.user?.name} members`,
    data: { teams },
  });
});

export const createTeam = asyncWrapper(async (req: Request, res: Response) => {
  const path = req.file?.filename;
  const creator = req.user?._id;
  const { name, description } = req.body;

  let team = await Team.create({
    creator,
    name,
    profile: path,

    description,
  });

  return res.status(StatusCodes.CREATED).json({
    status: "success",
    message: `${team.name} is created`,
    data: {
      team: { name, profile: team.profile, description, _id: team._id },
    },
  });
});
export const getTeam = asyncWrapper(async (req: Request, res: Response) => {
  const id = req.params.id;
  const team = await Team.findById(id)
    .populate("creator", "name email profile")
    .populate("members", "name email profile")
    .populate({
      path: "todos",
      select: "content status createdAt", // Select fields from todos
      populate: { path: "assignee", select: "name email profile" },
    });

  if (!team) throw new BadRequest("Invalid team request");
  team.todos.sort((a, b) => a.order - b.order);

  return res.status(StatusCodes.OK).json({
    status: "success",
    message: `${team.name} data`,
    data: {
      team: {
        name: team.name,
        profile: team.profile,
        description: team.description,
        _id: team._id,
        creator: team.creator,
        members: team.members,
        todos: team.todos,
      },
    },
  });
});

export const addMember = asyncWrapper(async (req: Request, res: Response) => {
  const { userId, teamId } = req.body;
  const team = await Team.findById(teamId);
  if (!team) throw new BadRequest("Team id is invalid");
  team.members.push(userId);
  await team.save();

  return res.status(StatusCodes.OK).json({
    status: "success",
    message: `${team.name} add member`,
    data: {},
  });
});

export const removeMember = asyncWrapper(
  async (req: Request, res: Response) => {
    const { id: teamId, memberId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) throw new BadRequest("Team id is invalid");
    team.members = team.members.filter(
      (member) => member._id.toString() !== memberId.toString()
    ) as Types.DocumentArray<IUser>;
    await team.save();

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `${team.name} removed from being a member`,
      data: {},
    });
  }
);

export const updateTodosOrderingController = asyncWrapper(
  async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const reorderTodos = req.body;

    console.log(reorderTodos);

    const team = await Team.findById(teamId);
    if (!team)
      throw new BadRequest("Team id is invalid to perform todos reordering");

    // Update the order of todos in team object
    team.todos = reorderTodos;

    // Save the updated team document
    await team.save();

    // Fetch and update corresponding Todo documents
    for (const todo of reorderTodos) {
      await Todo.findByIdAndUpdate(todo._id, todo);
    }

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `${team.name} perform reordering of todos`,
      data: {},
    });
  }
);
