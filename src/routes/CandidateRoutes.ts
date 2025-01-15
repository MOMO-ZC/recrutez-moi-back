import { Router } from "express";
import { registerCandidate } from "../controllers/AuthenticationController";

const router = Router();

router.get("/register", (request, response) => {
  // TODO: Validate data

  registerCandidate(request.body);
});

export default router;
