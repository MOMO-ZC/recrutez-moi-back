import SkillRepository from "../db/repositories/SkillRepository";
import {
  CreateSkillRequest,
  DeleteSkillRequest,
  GetAllSkillsRequest,
  GetSkillByIdRequest,
  GetSkillsByCategoryRequest,
  GetSkillsByTypeRequest,
  UpdateSkillRequest,
} from "../formats/SkillRequests";
import {
  GetSkillsResponse,
  GetSkillResponse,
  DeleteSkillResponse,
} from "../formats/SkillResponses";

const skillRepository = new SkillRepository();

export const CreateSkill = async (
  request: CreateSkillRequest
): Promise<GetSkillResponse> => {
  const skill = await skillRepository.createSkill(
    request.name,
    request.type,
    request.category
  );

  return {
    id: skill.id,
    name: skill.name,
    type: skill.type as "Softskill" | "Hardskill",
    category: skill.category,
  };
};

export const GetAllSkills = async (
  request: GetAllSkillsRequest
): Promise<GetSkillsResponse> => {
  const skills = await skillRepository.getAll();

  return {
    skills: skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      type: skill.type as "Softskill" | "Hardskill",
      category: skill.category,
    })),
  };
};

export const GetSkillById = async (
  request: GetSkillByIdRequest
): Promise<GetSkillResponse> => {
  const skill = await skillRepository.getById(request.id);

  if (!skill) {
    throw new Error("Skill not found");
  }

  return {
    id: skill.id,
    name: skill.name,
    type: skill.type as "Softskill" | "Hardskill",
    category: skill.category,
  };
};

export const GetSkillsByType = async (
  request: GetSkillsByTypeRequest
): Promise<GetSkillsResponse> => {
  const skills = await skillRepository.getByType(request.type);

  return {
    skills: skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      type: skill.type as "Softskill" | "Hardskill",
      category: skill.category,
    })),
  };
};

export const GetSkillsByCategory = async (
  request: GetSkillsByCategoryRequest
): Promise<GetSkillsResponse> => {
  const skills = await skillRepository.getByCategory(request.category);

  return {
    skills: skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      type: skill.type as "Softskill" | "Hardskill",
      category: skill.category,
    })),
  };
};

export const GetAllTypes = async (): Promise<string[]> => {
  return await skillRepository.getAllTypes();
};

export const GetAllCategories = async (): Promise<string[]> => {
  return await skillRepository.getAllCategories();
};

export const UpdateSkill = async (
  request: UpdateSkillRequest
): Promise<GetSkillResponse> => {
  // Check if the skill exists
  if (!(await skillRepository.getById(request.id))) {
    throw new Error("Skill not found");
  }

  const skill = await skillRepository.updateSkill(
    request.id,
    request.name,
    request.type,
    request.category
  );

  return {
    id: skill.id,
    name: skill.name,
    type: skill.type as "Softskill" | "Hardskill",
    category: skill.category,
  };
};

export const DeleteSkill = async (
  request: DeleteSkillRequest
): Promise<DeleteSkillResponse> => {
  // Check if the skill exists
  if (!(await skillRepository.getById(request.id))) {
    throw new Error("Skill not found");
  }

  await skillRepository.deleteSkill(request.id);

  return {};
};
