import ExperienceRepository from "../db/repositories/ExperienceRepository";
import {
  CreateExperienceRequest,
  DeleteExperienceRequest,
  GetAllExperiencesRequest,
  GetExperienceByIdRequest,
  UpdateExperienceRequest,
} from "../formats/ExperienceRequests";
import { GetExperienceResponse } from "../formats/ExperienceResponses";

const experienceRepository = new ExperienceRepository();

export const CreateExperience = async (
  request: CreateExperienceRequest
): Promise<GetExperienceResponse> => {
  const result = await experienceRepository.createExperience(
    request.name,
    request.skills
  );

  return {
    id: result.id,
    name: result.name,
    skills: result.skills,
  };
};

export const GetExperienceById = async (
  request: GetExperienceByIdRequest
): Promise<GetExperienceResponse> => {
  const result = await experienceRepository.getExperienceById(request.id);

  return {
    id: result.id,
    name: result.name,
    skills: result.skills,
  };
};

export const GetExperiences = async (
  request: GetAllExperiencesRequest
): Promise<{ experiences: GetExperienceResponse[] }> => {
  const result = await experienceRepository.getAllExperiences();

  return result;
};

export const UpdateExperience = async (
  request: UpdateExperienceRequest
): Promise<GetExperienceResponse> => {
  const result = await experienceRepository.updateExperience(
    request.id,
    request.name,
    request.skills
  );

  return result;
};

export const DeleteExperience = async (
  request: DeleteExperienceRequest
): Promise<void> => {
  await experienceRepository.deleteExperience(request.id);
};
