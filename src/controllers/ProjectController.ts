import ProjectRepository from "../db/repositories/ProjectRepository";
import {
  CreateProjectRequest,
  CreateProjectTypeRequest,
  DeleteProjectRequest,
  GetAllProjectTypesRequest,
  GetProjectByIdRequest,
  GetUserProjectsRequest,
  UpdateProjectRequest,
} from "../formats/ProjectRequests";
import {
  CreateProjectTypeResponse,
  GetAllProjectTypesResponse,
  GetProjectResponse,
  GetProjectsResponse,
  GetUserProjectsResponse,
} from "../formats/ProjectResponses";

const projectRepository = new ProjectRepository();

export const createProject = async (
  request: CreateProjectRequest
): Promise<GetProjectResponse> => {
  const project = await projectRepository.create(request);

  return {
    id: project.id,
    id_user: project.id_user,
    name: project.name,
    description: project.description,
    type: project.type,
    skills: project.skills,
    created_at: new Date(project.created_at),
    modified_at: new Date(project.modified_at),
  };
};

export const getProjectById = async (
  request: GetProjectByIdRequest
): Promise<GetProjectResponse> => {
  const project = await projectRepository.findById(request.id);

  if (!project) {
    // TODO: Implement custom error
    throw new Error("Project not found");
  }

  return {
    id: project.id,
    id_user: project.id_user,
    name: project.name,
    description: project.description,
    type: project.type,
    skills: project.skills,
    created_at: new Date(project.created_at),
    modified_at: new Date(project.modified_at),
  };
};

export const getProjects = async (): Promise<GetProjectsResponse> => {
  const projects = await projectRepository.findAll();
  return {
    projects: projects.map((project) => ({
      ...project,
      created_at: new Date(project.created_at),
      modified_at: new Date(project.modified_at),
    })),
  };
};

export const getProjectsOfUser = async (
  request: GetUserProjectsRequest
): Promise<GetUserProjectsResponse> => {
  const projects = await projectRepository.findForUser(request.id_user);
  return projects;
};

export const updateProject = async (
  request: UpdateProjectRequest
): Promise<void> => {
  // Get the project to check if it exists and verify authorization
  const project = await projectRepository.findById(request.id);

  if (!project) {
    throw new Error("Project not found");
  }
  if (project.id_user !== request.id_user) {
    throw new Error("Unauthorized access");
  }

  await projectRepository.update(request.id, request);
};

export const deleteProject = async (
  request: DeleteProjectRequest
): Promise<void> => {
  // Get the project to check if it exists and verify authorization
  const project = await projectRepository.findById(request.id);

  if (!project) {
    throw new Error("Project not found");
  }
  if (project.id_user !== request.id_user) {
    throw new Error("Unauthorized access");
  }

  await projectRepository.delete(request.id);
};

export const getProjectTypes = async (
  request: GetAllProjectTypesRequest
): Promise<GetAllProjectTypesResponse> => {
  const projectTypes = await projectRepository.getAllProjectTypes();
  return { projectTypes };
};

export const createProjectType = async (
  request: CreateProjectTypeRequest
): Promise<CreateProjectTypeResponse> => {
  await projectRepository.createProjectType(request.name);
  return {};
};
