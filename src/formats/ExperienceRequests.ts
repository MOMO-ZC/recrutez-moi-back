export interface CreateExperienceRequest {
  name: string;
}

export interface UpdateExperienceRequest {
  id: number; // Set in the route parameters
  name?: string;
}

export interface DeleteExperienceRequest {
  id: number; // Set in the route parameters
}

export interface GetExperienceByIdRequest {
  id: number; // Set in the route parameters
}

export interface GetAllExperiencesRequest {}
