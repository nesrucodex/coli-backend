import { StatusCodes } from "http-status-codes";
class RouteError extends Error {
  public statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  public statusText = "error";
  constructor(message: string, public data = {}) {
    super(message);
  }
}

export default RouteError;
