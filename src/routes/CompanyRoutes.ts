import { Router } from "express";
import { registerCompany } from "../controllers/AuthenticationController";

const router = Router();

router.post("/register", async (request, response) => {
  // TODO: Validate data

  registerCompany(request.body);
});

export default router;
