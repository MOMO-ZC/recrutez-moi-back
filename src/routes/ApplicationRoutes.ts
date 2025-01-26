import { Router } from "express";
import {
  AboutApplication,
  AcceptApplication,
  GetUserApplications,
  RejectApplication,
} from "../controllers/ApplicationController";
import authenticationMiddleware from "../middlewares/authentication";

const router = Router();

// Get info about application
router.get("/:id", authenticationMiddleware, async (request, response) => {
  const controllerResponse = await AboutApplication({
    id: parseInt(request.params.id),
    id_user: parseInt(request.params.userId),
  });

  response.json(controllerResponse);
});

// Get all applications for a user
router.get("/", authenticationMiddleware, async (request, response) => {
  const controllerResponse = await GetUserApplications({
    userId: parseInt(request.params.userId),
  });

  response.json(controllerResponse);
});

// Accept an application
router.post(
  "/:id/accept",
  authenticationMiddleware,
  async (request, response) => {
    const controllerResponse = await AcceptApplication({
      id: parseInt(request.params.id),
      userId: parseInt(request.params.userId),
      rejectPendingApplications: request.body.rejectPendingApplications,
    });

    response.json(controllerResponse);
  }
);

// Reject an application
router.post(
  "/:id/reject",
  authenticationMiddleware,
  async (request, response) => {
    const controllerResponse = await RejectApplication({
      id: parseInt(request.params.id),
      userId: parseInt(request.params.userId),
    });

    response.json(controllerResponse);
  }
);

export default router;
