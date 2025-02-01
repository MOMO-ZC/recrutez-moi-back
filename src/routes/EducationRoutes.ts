import { Router } from "express";
import {
  CreateEducation,
  DeleteEducation,
  GetAllDiplomas,
  GetAllDomains,
  GetAllEducations,
  GetDiplomasByDomain,
  GetEducationById,
  UpdateEducation,
} from "../controllers/EducationController";

const router = Router();

// Get all educations
router.get("/", async (request, response) => {
  const controllerResponse = await GetAllEducations({});

  response.json(controllerResponse);
});

// Get all domains
router.get("/domains", async (request, response) => {
  const controllerResponse = await GetAllDomains({});

  response.json(controllerResponse);
});

// Get all diplomas
router.get("/diplomas", async (request, response) => {
  const controllerResponse = await GetAllDiplomas({});

  response.json(controllerResponse);
});

// Get all diplomas by domain
router.get("/domains/:domain/diplomas", async (request, response) => {
  const controllerResponse = await GetDiplomasByDomain({
    domain: request.params.domain,
  });

  response.json(controllerResponse);
});

// Get education by id
router.get("/:id", async (request, response) => {
  const controllerResponse = await GetEducationById({
    id: parseInt(request.params.id),
  });

  response.json(controllerResponse);
});

// Create education
router.post("/", async (request, response) => {
  const controllerResponse = await CreateEducation(request.body);

  response.json(controllerResponse);
});

// Update education
router.patch("/:id", async (request, response) => {
  const controllerResponse = await UpdateEducation({
    id: parseInt(request.params.id),
    ...request.body,
  });

  response.json(controllerResponse);
});

// Delete education
router.delete("/:id", async (request, response) => {
  const controllerResponse = await DeleteEducation({
    id: parseInt(request.params.id),
  });

  response.json(controllerResponse);
});

export default router;
