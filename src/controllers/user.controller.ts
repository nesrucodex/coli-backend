import { Request, Response } from "express";
import BadRequest from "../errors/BadRequest";
import User from "../model/user.model";
import { StatusCodes } from "http-status-codes";
import asyncWrapper from "../middleware/asyncWrapper";
import bcrypt from "bcrypt";
import UnauthorizedError from "../errors/UnauthorizedError";

export const signInController = asyncWrapper(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email) throw new BadRequest("Email is required");
    if (!password) throw new BadRequest("Password is required");

    const user = await User.findOne({ email });
    if (!user) throw new BadRequest("You didn't signed up, sign up!!!");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedError(
        "The password you provided is wrong, try again"
      );

    const token = user.createToken();
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `${user.name} has signed in`,
      token,
      data: {
        user: { name: user.name, email, _id: user._id, profile: user.profile },
      },
    });
  }
);
export const signUpController = asyncWrapper(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const profile = req.file?.filename;
    console.log(req.body, profile)

    const isEmailTaken = await User.findOne({ email });

    if (isEmailTaken) {
      throw new BadRequest("Email is taken", {});
    }

    let user = await User.create({ name, email, password, profile });
    const token = user.createToken();

    return res.status(StatusCodes.CREATED).json({
      status: "success",
      message: `${name} has signed up`,
      token,
      data: { user: { name, email, _id: user._id, profile } },
    });
  }
);

export const getUserController = asyncWrapper(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user)
      throw new UnauthorizedError(
        "You aren't registerd or you token is invalid, try signing again!"
      );

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `${user.name} is authenticated`,
      data: {
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          profile: user.profile,
        },
      },
    });
  }
);
export const getSearchedUsersController = asyncWrapper(
  async (req: Request, res: Response) => {
    const { search } = req.body;
    let users = await User.find({
      email: { $regex: search, $options: "i" },
    }).select("-__v -password");

    users = users.filter(
      (user) => user._id.toString() !== req.user?._id.toString()
    );

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `Searched users by :${search}`,
      data: {
        users,
      },
    });
  }
);
