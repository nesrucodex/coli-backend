import { Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

export default (req: Request, res: Response) => {
  res
    .status(StatusCodes.NOT_FOUND)
    .json({
      status: "error",
      message: getReasonPhrase(StatusCodes.NOT_FOUND),
      data: {},
    });
};
