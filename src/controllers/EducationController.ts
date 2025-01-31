import EducationRepository from "../db/repositories/EducationRepository";
import {
  CreateEducationRequest,
  DeleteEducationRequest,
  GetAllDiplomasRequest,
  GetAllDomainsRequest,
  GetAllEducationsRequest,
  GetDiplomasByDomainRequest,
  GetEducationByIdRequest,
  UpdateEducationRequest,
} from "../formats/EducationRequests";
import {
  DeleteEducationResponse,
  GetDiplomasResponse,
  GetDomainsResponse,
  GetEducationResponse,
  GetEducationsResponse,
  UpdateEducationResponse,
} from "../formats/EducationResponses";

const educationRepository = new EducationRepository();

export const GetAllEducations = async (
  request: GetAllEducationsRequest
): Promise<GetEducationsResponse> => {
  const educations = await educationRepository.getAll();

  return {
    educations,
  };
};

export const GetEducationById = async (
  request: GetEducationByIdRequest
): Promise<GetEducationResponse> => {
  const education = await educationRepository.getById(request.id);

  return education;
};

export const CreateEducation = async (
  request: CreateEducationRequest
): Promise<GetEducationResponse> => {
  const education = await educationRepository.create(
    request.domain,
    request.diploma
  );

  return education;
};

export const UpdateEducation = async (
  request: UpdateEducationRequest
): Promise<UpdateEducationResponse> => {
  await educationRepository.update(request.id, request.domain, request.diploma);

  return {};
};

export const DeleteEducation = async (
  request: DeleteEducationRequest
): Promise<DeleteEducationResponse> => {
  await educationRepository.delete(request.id);

  return {};
};

export const GetAllDomains = async (
  request: GetAllDomainsRequest
): Promise<GetDomainsResponse> => {
  const domains = await educationRepository.getAllDomains();

  return {
    domains,
  };
};

export const GetAllDiplomas = async (
  request: GetAllDiplomasRequest
): Promise<GetDiplomasResponse> => {
  const diplomas = await educationRepository.getAllDiplomas();

  return {
    diplomas,
  };
};

export const GetDiplomasByDomain = async (
  request: GetDiplomasByDomainRequest
): Promise<GetDiplomasResponse> => {
  const diplomas = await educationRepository.getDiplomasByDomain(
    request.domain
  );

  return {
    diplomas,
  };
};
