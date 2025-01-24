import { Router } from "express";
import { registerCandidate } from "../controllers/AuthenticationController";
import {
  AboutCandidate,
  UpdateCandidate,
} from "../controllers/CandidateController";
import { UserNotFoundError } from "../exceptions/UserExceptions";
import { ErrorResponse } from "../formats/ErrorResponse";

const router = Router();

// Register candidate
router.post("/register", async (request, response) => {
  // TODO: Validate data

  const controllerResponse = await registerCandidate(request.body);
  if (!controllerResponse) {
    response.status(401).send("Could not register candidate.");
    return;
  }

  response.json(controllerResponse);
});

// Get candidate info
router.get("/:id", async (request, response) => {
  const id = request.params.id;

  try {
    const idNumber = parseInt(id);
    const candidate = await AboutCandidate({ id: idNumber });

    response.json(candidate);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      response
        .status(404)
        .json(new ErrorResponse(error.message, error, error.stack));
    } else {
      response
        .status(500)
        .json(new ErrorResponse("Internal server error", error));
    }
    return;
  }
});

// Update candidate
router.patch("/:id", async (request, response) => {
  // TODO: Validate data
  const id = request.params.id;

  try {
    await UpdateCandidate({ id, ...request.body });

    response.status(200).send();
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      response
        .status(404)
        .json(new ErrorResponse(error.message, error, error.stack));
    } else {
      response
        .status(500)
        .json(new ErrorResponse("Internal server error", error));
    }
    return;
  }
});

export default router;
