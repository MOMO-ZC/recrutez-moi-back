export interface CreateExperienceRequest {
  name: string;
  skills?: number[]; // References skill IDs
}

export interface UpdateExperienceRequest {
  id: number; // Set in the route parameters
  name?: string;
  skills?: number[]; // References skill IDs
}

export interface DeleteExperienceRequest {
  id: number; // Set in the route parameters
}

export interface GetExperienceByIdRequest {
  id: number; // Set in the route parameters
}

export interface GetAllExperiencesRequest {}
