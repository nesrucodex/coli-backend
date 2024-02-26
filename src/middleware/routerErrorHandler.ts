import { Request, Response, NextFunction } from "express";
import RouteError from "../errors/RouteError";
import { StatusCodes } from "http-status-codes";

export default (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err?.message);

  if (err instanceof RouteError)
    return res
      .status(err.statusCode)
      .json({ status: err.statusText, message: err.message, data: err.data });

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: err.message,
    data: {},
  });
};
