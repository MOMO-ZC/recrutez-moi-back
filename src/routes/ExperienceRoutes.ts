import { Router } from "express";
import {
  CreateExperience,
  DeleteExperience,
  GetExperienceById,
  GetExperiences,
  UpdateExperience,
} from "../controllers/ExperienceController";

const router = Router();

// Create an experience
router.post("/", async (request, response) => {
  const controllerResponse = await CreateExperience({
    name: request.body.name,
  });

  response.json(controllerResponse);
});

// Update an experience
router.put("/:id", async (request, response) => {
  const controllerResponse = await UpdateExperience({
    id: parseInt(request.params.id),
    name: request.body.name,
  });

  response.json(controllerResponse);
});

// Get an experience by its ID
router.get("/:id", async (request, response) => {
  const controllerResponse = await GetExperienceById({
    id: parseInt(request.params.id),
  });

  response.json(controllerResponse);
});

// Get all experiences
router.get("/", async (request, response) => {
  const controllerResponse = await GetExperiences({});

  response.json(controllerResponse);
});

// Delete experience
router.delete("/:id", async (request, response) => {
  const controllerResponse = await DeleteExperience({
    id: parseInt(request.params.id),
  });

  response.json(controllerResponse);
});

export default router;
