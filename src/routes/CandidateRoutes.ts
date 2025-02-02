import { Router } from "express";
import { registerCandidate } from "../controllers/AuthenticationController";
import {
  AboutCandidate,
  AddCandidateEducation,
  DeleteCandidateEducation,
  GetCandidateEducations,
  GetCandidateSkills,
  UpdateCandidate,
} from "../controllers/CandidateController";
import { UserNotFoundError } from "../exceptions/UserExceptions";
import { ErrorResponse } from "../formats/ErrorResponse";
import authenticationMiddleware from "../middlewares/authentication";
import { UnauthorizedAccessError } from "../exceptions/GeneralExceptions";
import {
  deleteProject,
  getProjectById,
  getProjectsOfUser,
  updateProject,
} from "../controllers/ProjectController";
import { CreateEducation } from "../controllers/EducationController";

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
      id: parseInt(id),
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
    }
    return;
  }
});

// Get user projects
router.get("/:id/projects", async (request, response) => {
  const id = parseInt(request.params.id);

  const controllerResponse = await getProjectsOfUser({ id_user: id });

  response.json(controllerResponse);
});

// Get single user project
router.get("/:id/projects/:projectId", async (request, response) => {
  const id = parseInt(request.params.id);
  const projectId = parseInt(request.params.projectId);

  const controllerResponse = await getProjectById({
    id: projectId,
  });

  if (controllerResponse.id_user !== id) {
    response.status(404).send("User doesn't own project with id " + projectId);
    return;
  }

  response.json(controllerResponse);
});

// Update a project
router.patch(
  "/:id/projects/:id_project",
  authenticationMiddleware,
  async (request, response) => {
    if (parseInt(request.params.id) !== parseInt(request.params.userId)) {
      response.status(401).send("Unauthorized access");
      return;
    }

    const controllerResponse = await updateProject({
      ...request.body,
      id: parseInt(request.params.id_project),
      id_user: parseInt(request.params.id),
    });

    response.json(controllerResponse);
  }
);

// Delete a project
router.delete(
  "/:id/projects/:id_project",
  authenticationMiddleware,
  async (request, response) => {
    if (parseInt(request.params.id) !== parseInt(request.params.userId)) {
      response.status(401).send("Unauthorized access");
      return;
    }

    const controllerResponse = await deleteProject({
      id: parseInt(request.params.id_project),
      id_user: parseInt(request.params.id),
    });

    response.json(controllerResponse);
  }
);

// Add education
router.post(
  "/:id/educations",
  authenticationMiddleware,
  async (request, response) => {
    // Check authorizations
    if (parseInt(request.params.id) !== parseInt(request.params.userId)) {
      response.status(401).send("Unauthorized access");
      return;
    }

    // Check if we are trying to create a new education
    if (request.body.id_education === undefined) {
      // TODO: Check if the education already exists

      // Create the education
      const createEducationControllerResponse = await CreateEducation({
        domain: request.body.domain,
        diploma: request.body.diploma,
      });

      request.body.id_education = createEducationControllerResponse.id;
    }

    const controllerResponse = await AddCandidateEducation({
      id_candidate: parseInt(request.params.id),
      id_education: parseInt(request.body.id_education),
      school: request.body.school,
      start: new Date(request.body.start),
      end: new Date(request.body.end),
    });

    response.json(controllerResponse);
  }
);

// Remove education
router.delete(
  "/:id/educations/:id_education",
  authenticationMiddleware,
  async (request, response) => {
    // Check authorizations
    if (parseInt(request.params.id) !== parseInt(request.params.userId)) {
      response.status(401).send("Unauthorized access");
      return;
    }

    const controllerResponse = await DeleteCandidateEducation({
      id_candidate: parseInt(request.params.id),
      id_education: parseInt(request.params.id_education),
    });

    response.status(200).send();
  }
);

// Get candidate educations
router.get("/:id/educations", async (request, response) => {
  const controllerResponse = await GetCandidateEducations({
    id_candidate: parseInt(request.params.id),
  });

  response.json(controllerResponse);
});

// Get candidate skills
router.get("/:id/skills", async (request, response) => {
  const controllerResponse = await GetCandidateSkills(
    parseInt(request.params.id)
  );

  response.json(controllerResponse);
});

export default router;
