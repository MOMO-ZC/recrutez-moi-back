import { Router } from "express";
import {
  CreateSkill,
  DeleteSkill,
  GetAllCategories,
  GetAllSkills,
  GetAllTypes,
  GetSkillById,
  GetSkillsByCategory,
  GetSkillsByType,
  UpdateSkill,
} from "../controllers/SkillController";

const router = Router();

// Create a skill
// FIXME: Everyone is allowed to create a skill. Check if that is supposed to be OK
router.post("/", async (request, response) => {
  const controllerResponse = await CreateSkill(request.body);

  response.status(201).json(controllerResponse);
});

// Get all skills
router.get("/", async (request, response) => {
  const controllerResponse = await GetAllSkills({});

  response.json(controllerResponse);
});

// Get all skill types
router.get("/types", async (request, response) => {
  const controllerResponse = await GetAllTypes();

  response.json(controllerResponse);
});

// Get skills by type
router.get("/types/:type", async (request, response) => {
  const type = request.params.type;
  if (type !== "Softskill" && type !== "Hardskill") {
    response.status(400).json({
      error: "Invalid type. Should be either 'Softskill' or 'Hardskill'.",
    });
    return;
  }

  const controllerResponse = await GetSkillsByType({ type: type });

  response.json(controllerResponse);
});

// Get all skill categories
router.get("/categories", async (request, response) => {
  const controllerResponse = await GetAllCategories();

  response.json(controllerResponse);
});

// Get skills by category
router.get("/categories/:category", async (request, response) => {
  const controllerResponse = await GetSkillsByCategory({
    category: request.params.category,
  });

  response.json(controllerResponse);
});

// Get skill by ID
router.get("/:id", async (request, response) => {
  const controllerResponse = await GetSkillById({
    id: parseInt(request.params.id),
  });

  response.json(controllerResponse);
});

// Update skill
// FIXME: Everyone is allowed to update a skill. Check if that is supposed to be OK
router.put("/:id", async (request, response) => {
  const controllerResponse = await UpdateSkill({
    id: parseInt(request.params.id),
    name: request.body.name,
    type: request.body.type,
    category: request.body.category,
  });

  response.json(controllerResponse);
});

// Delete skill
// FIXME: Everyone is allowed to delete a skill. Check if that is supposed to be OK
router.delete("/:id", async (request, response) => {
  const controllerResponse = await DeleteSkill({
    id: parseInt(request.params.id),
  });

  response.json(controllerResponse);
});

export default router;
