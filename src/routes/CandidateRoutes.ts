import { Router } from "express";
import { registerCandidate } from "../controllers/AuthenticationController";
import {
  AboutCandidate,
  UpdateCandidate,
} from "../controllers/CandidateController";
import { UserNotFoundError } from "../exceptions/UserExceptions";
import { ErrorResponse } from "../formats/ErrorResponse";
import authenticationMiddleware from "../middlewares/authentication";
import { UnauthorizedAccessError } from "../exceptions/GeneralExceptions";

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
router.get("/:id", authenticationMiddleware, async (request, response) => {
  const id = request.params.id;

  try {
    const idNumber = parseInt(id);
    const candidate = await AboutCandidate({
      id: idNumber,
      userId: parseInt(request.params.userId),
      userRole: request.params.userRole,
    });

    response.json(candidate);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      response
        .status(404)
        .json(new ErrorResponse(error.message, error, error.stack));
    } else if (error instanceof UnauthorizedAccessError) {
      response
        .status(401)
        .json(new ErrorResponse("Unauthorized access", error, error.stack));
    } else {
      response
        .status(500)
        .json(new ErrorResponse("Internal server error", error));
    }
    return;
  }
});

// Update candidate
router.patch("/:id", authenticationMiddleware, async (request, response) => {
  // TODO: Validate data
  const id = request.params.id;

  try {
    await UpdateCandidate({
      id: id,
      userId: parseInt(request.params.userId),
      ...request.body,
    });

    response.status(200).send();
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      response
        .status(404)
        .json(new ErrorResponse(error.message, error, error.stack));
    } else if (error instanceof UnauthorizedAccessError) {
      response
        .status(401)
        .json(new ErrorResponse("Unauthorized access", error, error.stack));
    } else {
      response
        .status(500)
        .json(new ErrorResponse("Internal server error", error));
    }
    return;
  }
});

export default router;
