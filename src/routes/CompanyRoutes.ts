import { Router } from "express";
import { registerCompany } from "../controllers/AuthenticationController";
import { UserNotFoundError } from "../exceptions/UserExceptions";
import { ErrorResponse } from "../formats/ErrorResponse";
import { AboutCompany, UpdateCompany } from "../controllers/CompanyController";
import authenticationMiddleware from "../middlewares/authentication";
import { UnauthorizedAccessError } from "../exceptions/GeneralExceptions";

const router = Router();

// Register a new company
router.post("/register", async (request, response) => {
  // TODO: Validate data

  const controllerResponse = await registerCompany(request.body);
  if (!controllerResponse) {
    response.status(401).send("Could not register company.");
    return;
  }

  response.json(controllerResponse);
});

// Get company info
router.get("/:id", async (request, response) => {
  const id = request.params.id;

  try {
    const idNumber = parseInt(id);
    const company = await AboutCompany({ id: idNumber });

    response.json(company);
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

// Update company
router.patch("/:id", authenticationMiddleware, async (request, response) => {
  // TODO: Validate data
  const id = parseInt(request.params.id);
  const userId = parseInt(request.params.userId);

  try {
    await UpdateCompany({ id, userId, ...request.body });

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
