import {Router} from "express";
import {registerCompany} from "../controllers/AuthenticationController";

const router = Router();

router.post("/register", async (request, response) => {
  // TODO: Validate data

  const controllerResponse = await registerCompany(request.body);
  if (!controllerResponse) {
    response.status(401).send("Could not register company.");
    return;
  }

  response.json(controllerResponse);
});

export default router;
