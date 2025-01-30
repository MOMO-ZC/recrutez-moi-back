import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectsOfUser,
  getProjectTypes,
  updateProject,
} from "../controllers/ProjectController";
import authenticationMiddleware from "../middlewares/authentication";

const router = Router();

// Create a project
router.post("/", authenticationMiddleware, async (request, response) => {
  const controllerResponse = await createProject({
    ...request.body,
    id_user: parseInt(request.params.userId),
  });

  response.json(controllerResponse);
});

// Get all project types
router.get("/types", async (request, response) => {
  const controllerResponse = await getProjectTypes(request.body);

  response.json(controllerResponse);
});

// Get a project by its id
router.get("/:id", async (request, response) => {
  const controllerResponse = await getProjectById({
    id: parseInt(request.params.id),
  });

  response.json(controllerResponse);
});

// Get all project
// router.get("/", async (request, response) => {
//   const controllerResponse = await getProjects();

//   response.json(controllerResponse);
// });

// Get the user's projects
router.get("/", authenticationMiddleware, async (request, response) => {
  const controllerResponse = await getProjectsOfUser({
    id_user: parseInt(request.params.userId),
  });
  response.json(controllerResponse);
});

// Update a project
router.patch("/:id", authenticationMiddleware, async (request, response) => {
  const controllerResponse = await updateProject({
    ...request.body,
    id: parseInt(request.params.id),
    id_user: parseInt(request.params.userId),
  });

  response.json(controllerResponse);
});

// Delete a project
router.delete("/:id", authenticationMiddleware, async (request, response) => {
  const controllerResponse = await deleteProject({
    id: parseInt(request.params.id),
    id_user: parseInt(request.params.userId),
  });

  response.json(controllerResponse);
});

// Get all project types
router.get("/types", async (request, response) => {
  const controllerResponse = await getProjectTypes(request.body);

  response.json(controllerResponse);
});

export default router;
