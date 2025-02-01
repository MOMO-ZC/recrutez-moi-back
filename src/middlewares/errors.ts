import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../formats/ErrorResponse";

const errorMiddleware = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  response
    .status(500)
    .json(
      new ErrorResponse(
        error.message ?? "Internal server error",
        error,
        error.stack
      )
    );
};

export default errorMiddleware;
