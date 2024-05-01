import { Request, Response } from "express";
import BadRequest from "../errors/BadRequest";
import asyncWrapper from "../middleware/asyncWrapper";
import { StatusCodes } from "http-status-codes";
import { Notification } from "../model/notification.model";
import { Team } from "../model/team.model";
import User from "../model/user.model";
import { MEMBER_STATUS, NOTIFICATION_TYPES } from "../constants/global";

export const getNotificationsController = asyncWrapper(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    const notifications = await Notification.find({ recipient: userId })
      .sort({
        createdAt: -1,
      })
      .populate("team", "name profile")
      .populate("recipient", "name email profile");

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Notifications retrieved successfully",
      data: {
        notifications,
      },
    });
  }
);

/**
 * 
 * const notification = {
      teamId: team._id,
      type: NOTIFICATION_TYPES.TODO_STATUS_CHANGED,
      data: {
        dUserId,
        sUserId,
        sTodoStatus,
        dTodoStatus,
      },
    };
 */
export const createNotification = asyncWrapper(
  async (req: Request, res: Response) => {
    const {
      teamId,
      type,
      data: { dUserId, sUserId, sTodoStatus, dTodoStatus },
    } = req.body;
    console.log("🚀 ~ req.body:", req.body);

    const dUser = await User.findById(dUserId);
    const sUser = await User.findById(sUserId);

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

    if (!team) throw new BadRequest("Team id is invalid");
    if (!sUser) throw new BadRequest("sUser id is invalid");
    if (!dUser) throw new BadRequest("dUser id is invalid");

    if (sUser._id.toString() === dUser._id.toString()) {
      if (sUser._id.toString() !== team.creator._id.toString()) {
        await Notification.create({
          recipient: team.creator._id,
          team: team._id,
          type: NOTIFICATION_TYPES.TODO_STATUS_CHANGED,
          content: `${sUser.name} has changed the status of todo from ${sTodoStatus} to ${dTodoStatus} in the ${team.name} team.`,
        });
      }
      const nots = await Promise.all(
        team.members
          .filter((mem) => mem.status === MEMBER_STATUS.MEMBER)
          .map(async (mem) => {
            if (mem.user._id.toString() !== sUser._id.toString())
              await Notification.create({
                recipient: mem.user._id,
                team: team._id,
                type: NOTIFICATION_TYPES.TODO_STATUS_CHANGED,
                content: `${sUser.name} has changed the status of todo from ${sTodoStatus} to ${dTodoStatus} in the ${team.name} team.`,
              });
          })
      );
      console.log("🚀 12 ~ nots:", nots);
    } else {
      const nots = await Promise.all(
        team.members
          .filter((mem) => mem.status === MEMBER_STATUS.MEMBER)
          .map(async (mem) => {
            if (mem.user._id.toString() !== sUser._id.toString())
              await Notification.create({
                recipient: mem.user._id,
                team: team._id,
                type: NOTIFICATION_TYPES.TODO_STATUS_CHANGED,
                content: `${sUser.name} assigned todo to ${dUser.name} in the ${team.name} team.`,
              });
          })
      );
      console.log("🚀 234 ~ nots:", nots);
    }

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Notification is created for todo state change in dnd",
      data: {},
    });
  }
);

export const markNotificationAsReadController = asyncWrapper(
  async (req: Request, res: Response) => {
    const notificationId = req.params.notificationId;

    const notification = await Notification.findById(notificationId);
    if (!notification) throw new BadRequest("Notification not found");

    notification.read = true;
    await notification.save();

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Notification marked as read",
      data: {
        notification,
      },
    });
  }
);

export const deleteNotificationController = asyncWrapper(
  async (req: Request, res: Response) => {
    const notificationId = req.params.notificationId;

    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) throw new BadRequest("Notification not found");

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Notification deleted successfully",
      data: {
        notification,
      },
    });
  }
);
