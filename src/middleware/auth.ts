import { NextFunction, Request, Response } from "express";
import UnauthorizedError from "../errors/UnauthorizedError";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import asyncWrapper from "./asyncWrapper";
dotenv.config();

// * Extending existing interface to include extra properites
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: any;
        name: string;
      };
    }
  }
}

const SECRET = process.env.SECRET as string;

export const authenticationMiddleWare = asyncWrapper(
  (req: Request, res: Response, next: NextFunction) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader)
      throw new UnauthorizedError("You are't authenticated");
    const token = authorizationHeader.split(" ")[1];

    const decoded = jwt.verify(token, SECRET) as {
      userId: string;
      name: string;
    };
    
    const { userId, name } = decoded;
    req.user = { _id: userId, name };
    next();
  }
);
