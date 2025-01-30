export interface GetProjectResponse {
  id: number;
  id_user: number;
  name: string;
  description: string;
  type: string;
  created_at: Date;
  modified_at: Date;
  skills: {
    id: number;
    name: string;
    type: string;
    category: string;
    created_at: Date;
  }[];
}

export interface GetProjectsResponse {
  projects: GetProjectResponse[];
}

export interface GetUserProjectsResponse {
  projects: GetProjectResponse[];
}

export interface UpdateProjectResponse {}

export interface DeleteProjectResponse {}

export interface GetAllProjectTypesResponse {
  projectTypes: {
    name: string;
  }[];
}

export interface CreateProjectTypeResponse {}
