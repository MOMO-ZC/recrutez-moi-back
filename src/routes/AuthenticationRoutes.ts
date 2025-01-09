import { Router, Request, Response } from "express";
import { logIn, register } from "../controllers/UserController";

const router = Router();

router.post("/register", async (request: Request, response: Response) => {
  // Check if the request body is valid and can be cast to a RegisterRequest
  if (
    !request.body.email ||
    !request.body.firstname ||
    !request.body.lastname ||
    !request.body.password
  ) {
    response.status(400).send("Invalid request body");
    return;
  }

  const controllerResponse = await register(request.body);
  if (!controllerResponse) {
    response.status(401).send("Invalid credentials");
    return;
  }

  response.json(controllerResponse);
  return;
});

router.post("/login", async (request: Request, response: Response) => {
  // Check if the request body is valid and can be cast to a LogInRequest
  if (!request.body.email || !request.body.password) {
    response.status(400).send("Invalid request body");
    return;
  }

  const controllerResponse = await logIn(request.body);
  console.log("token from route", controllerResponse);
  if (!controllerResponse) {
    response.status(401).send("Invalid credentials");
    return;
  }

  response.json(controllerResponse);
  return;
});

export default router;
