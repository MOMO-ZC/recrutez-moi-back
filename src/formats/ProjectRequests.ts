export interface CreateProjectRequest {
  id_user: number; // Set by the authentication middleware
  name: string;
  description: string;
  type: string; // References project type ID
  skills: number[]; // References skill IDs
}

export interface GetProjectByIdRequest {
  // id_user: number; // Set by the authentication middleware
  id: number;
}

export interface GetUserProjectsRequest {
  id_user: number;
}

export interface UpdateProjectRequest {
  id_user: number; // Set by the authentication middleware
  id: number;
  name?: string;
  description?: string;
  type?: string; // References project type ID
  skills?: number[]; // References skill IDs
}

export interface DeleteProjectRequest {
  id_user: number; // Set by the authentication middleware
  id: number;
}

export interface GetAllProjectTypesRequest {}

export interface CreateProjectTypeRequest {
  name: string;
}
