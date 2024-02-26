import { StatusCodes } from "http-status-codes";
import RouteError from "./RouteError";
class BadRequest extends RouteError {
  public statusCode = StatusCodes.BAD_REQUEST;
  constructor(message: string, data = {}) {
    super(message, data);
  }
}

export default BadRequest;
