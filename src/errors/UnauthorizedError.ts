import { StatusCodes } from "http-status-codes";
import RouteError from "./RouteError";
class UnauthorizedError extends RouteError {
  public statusCode = StatusCodes.UNAUTHORIZED;
  constructor(message: string, data = {}) {
    super(message, data);
  }
}

export default UnauthorizedError;
