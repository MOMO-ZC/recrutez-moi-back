import {Router} from "express";
import {registerCandidate} from "../controllers/AuthenticationController";

const router = Router();

router.post("/register", async (request, response) => {
  // TODO: Validate data

  const controllerResponse = await registerCandidate(request.body);
  if (!controllerResponse) {
    response.status(401).send("Could not register candidate.");
    return;
  }

  response.json(controllerResponse);
});

export default router;
