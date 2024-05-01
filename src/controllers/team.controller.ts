import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncWrapper from "../middleware/asyncWrapper";
import { Team } from "../model/team.model";
import BadRequest from "../errors/BadRequest";

import { IMemberStatus, ITeam, ITodo } from "../types/global";
import { Todo } from "../model/todo.model";
import { Types } from "mongoose";
import { MEMBER_STATUS, NOTIFICATION_TYPES } from "../constants/global";
import { Notification } from "../model/notification.model";
import User from "../model/user.model";

export const getTeams = asyncWrapper(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const teams = await Team.find({
    $or: [{ creator: userId }, { "members.user": userId }],
  })
    .populate("creator", "name email profile")
    .populate({ path: "members.user", select: "name email profile" })
    .populate({ path: "unassignedTodos", select: "content status createdAt" })
    .populate({ path: "members.todos", select: "content status createdAt" });

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

export const updateTeam = asyncWrapper(async (req: Request, res: Response) => {
  const path = req.file?.filename;
  const { name, description } = req.body;
  const teamId = req.params.id;

  const team = await Team.findById(teamId);

  if (!team) throw new BadRequest("Bad request for updating a team");

  team.name = name;
  team.description = description;
  team.profile = path;
  await team.save();

  return res.status(StatusCodes.OK).json({
    status: "success",
    message: `${team.name} is updated`,
    data: {
      team: { name, profile: path, description },
    },
  });
});
export const deleteTeam = asyncWrapper(async (req: Request, res: Response) => {
  const teamId = req.params.id;

  const team = await Team.findByIdAndDelete(teamId);
  if (!team) throw new BadRequest("Bad request for updating a team");

  return res.status(StatusCodes.OK).json({
    status: "success",
    message: `Team is deleted`,
    data: {},
  });
});

export const getTeam = asyncWrapper(async (req: Request, res: Response) => {
  const id = req.params.id;
  const team = await Team.findById(id)
    .populate("creator", "name email profile")
    .populate({ path: "members.user", select: "name email profile" })
    .populate({
      path: "members.todos",
      select: "content status createdAt",
    })
    .populate({
      path: "unassignedTodos",
      select: "content status createdAt",
      options: { sort: { order: 1 } },
    });

  if (!team) throw new BadRequest("Invalid team request");

  // Sort todos for each member
  team.members.forEach((member) => {
    member.todos.sort((a, b) => a.order - b.order);
  });

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
        unassignedTodos: team.unassignedTodos,
      },
    },
  });
});

export const requestMember = asyncWrapper(
  async (req: Request, res: Response) => {
    const { userId, teamId } = req.body;
    const team = (await Team.findById(teamId).populate({
      path: "creator",
      select: "name",
    })) as unknown as ITeam;
    if (!team) throw new BadRequest("Team id is invalid");

    // Initialize todos field as an empty DocumentArray<ITodo>
    const todos = [] as unknown as Types.DocumentArray<ITodo>;
    team.members.push({ user: userId, todos, status: MEMBER_STATUS.PENDING });
    await team.save();

    // ! Requested Member Notification
    await Notification.create({
      recipient: userId,
      type: NOTIFICATION_TYPES.MEMBER_REQUEST,
      team: team._id,
      content: `${req.user?.name} has requested you to join the ${team.name} team.`,
    });

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `${team.name} add member`,
      data: {},
    });
  }
);
export const removeMember = asyncWrapper(
  async (req: Request, res: Response) => {
    const { id: teamId, memberId } = req.params;
    console.log("🚀 ~ req.params:", req.params);

    const team = (await Team.findById(teamId).populate(
      "creator",
      "name"
    )) as ITeam;
    const member = await User.findById(memberId);
    if (!team) throw new BadRequest("Team id is invalid");
    if (!member) throw new BadRequest("Member id is invalid");

    // Filtering out the member with the given memberId
    team.members = team.members.filter(
      (member) => member.user._id.toString() !== memberId
    );

    const creator = team.creator as unknown as { _id: string; name: string };

    await team.save();

    // ! Requested Member Notification
    await Notification.create({
      recipient: memberId,
      team: team._id,
      type: NOTIFICATION_TYPES.GENERAL,
      content: `${creator.name} has removed you from ${team.name} team.`,
    });
    await Notification.create({
      recipient: req.user?._id,
      team: team._id,
      type: NOTIFICATION_TYPES.GENERAL,
      content: `You have removed ${member.name} from ${team.name} team.`,
    });

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `${team.name} removed from being a member`,
      data: {},
    });
  }
);
export const updateMemberStatus = asyncWrapper(
  async (req: Request, res: Response) => {
    const { teamId, memberId, memberStatus } = req.body;

    const team = await Team.findById(teamId);
    const member = await User.findById(memberId);

    if (!team) throw new BadRequest("Team id is invalid");
    if (!member) throw new BadRequest("Member id is invalid");

    team.members = team.members.map((member) => {
      if (member.user._id.toString() === memberId)
        return {
          ...member,
          status: memberStatus,
        };
      else return member;
    }) as {
      user: Types.ObjectId;
      todos: Types.DocumentArray<ITodo>;
      status: IMemberStatus;
    }[];

    await team.save();

    // ! Requested Member Notification
    if (memberStatus === MEMBER_STATUS.MEMBER) {
      await Notification.create({
        recipient: team.creator._id,
        team: team._id,
        type: NOTIFICATION_TYPES.GENERAL,
        content: `${member.name} joined your ${team.name} team.`,
      });

      await Promise.all(
        team.members.map(async (mem) => {
          if (
            mem.status === MEMBER_STATUS.MEMBER &&
            mem.user._id.toString() === member._id.toString()
          )
            await Notification.create({
              recipient: mem.user,
              team: team._id,
              type: NOTIFICATION_TYPES.GENERAL,
              content: `You joined ${team.name} team.`,
            });
          else
            await Notification.create({
              recipient: mem.user,
              team: team._id,
              type: NOTIFICATION_TYPES.GENERAL,
              content: `${member.name} joined ${team.name} team.`,
            });
        })
      );
    } else {
      const nots22 = await Notification.create({
        recipient: req.user?._id,
        team: team._id,
        type: NOTIFICATION_TYPES.GENERAL,
        content: `${member.name} blocked your request for joining ${team.name} team.`,
      });
      console.log("🚀 ~ nots22:", nots22);
    }

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `${team.name} removed from being a member`,
      data: {},
    });
  }
);

export const updateTodosOrderingController = asyncWrapper(
  async (req: Request, res: Response) => {
    const teamId = req.params.teamId;
    const updateTeam = req.body as ITeam;
    await Team.findByIdAndUpdate(teamId, { ...updateTeam });

    await Promise.all(
      updateTeam.unassignedTodos.map(async (todo) => {
        await Todo.findByIdAndUpdate(todo._id, todo);
      })
    );

    await Promise.all(
      updateTeam.members.map(async (member) => {
        await Promise.all(
          member.todos.map(async (todo) => {
            await Todo.findByIdAndUpdate(todo._id, todo);
          })
        );
      })
    );
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `perform reordering of todos`,
      data: {},
    });
  }
);
