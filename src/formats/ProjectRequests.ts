export interface CreateProjectRequest {
  id_user: number; // Set by the authentication middleware
  name: string;
  description: string;
  type: string; // References project type ID
  skills: number[]; // References skill IDs
}

export interface GetProjectByIdRequest {
  id: number; // Set in the route parameters
}

export interface GetUserProjectsRequest {
  id_user: number; // Set by the authentication middleware
}

export interface UpdateProjectRequest {
  id_user: number; // Set by the authentication middleware
  id: number; // Set in the route parameters
  name?: string;
  description?: string;
  type?: string; // References project type ID
  skills?: number[]; // References skill IDs
}

export interface DeleteProjectRequest {
  id_user: number; // Set by the authentication middleware
  id: number; // Set in the route parameters
}

export interface GetAllProjectTypesRequest {}

export interface CreateProjectTypeRequest {
  name: string;
}
