import { Request, Response, NextFunction } from "express";
import { TokenProvider } from "../providers/TokenProvider";
import { ErrorResponse } from "../formats/ErrorResponse";

const tokenProvider = new TokenProvider();

const authenticationMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    response.status(401).json({ message: "No token provided" });
  } else {
    const token = authHeader.split(" ")[1];

    if (!token) {
      response.status(401).json({ message: "Invalid token format" });
    } else {
      if (!tokenProvider.verify(token)) {
        response
          .status(401)
          .json(new ErrorResponse("Invalid token", new Error("Invalid token")));
      } else {
        const tokenInfo = tokenProvider.decode(token);
        request.params.userId = tokenInfo.id;
        request.params.userRole = tokenInfo.role;

        next();
      }
    }
  }
};

export default authenticationMiddleware;
