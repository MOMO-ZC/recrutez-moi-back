import {Router, Request, Response} from "express";
import {logIn} from "../controllers/AuthenticationController";

const router = Router();

router.post("/login", async (request: Request, response: Response) => {
  // Check if the request body is valid and can be cast to a LogInRequest
  if (!request.body.email || !request.body.password) {
    response.status(400).send("Invalid request body");
    return;
  }

  const controllerResponse = await logIn(request.body);
  if (!controllerResponse) {
    response.status(401).send("Invalid credentials");
    return;
  }

  response.json(controllerResponse);
  return;
});

export default router;
