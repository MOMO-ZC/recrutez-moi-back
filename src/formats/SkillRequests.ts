export interface CreateSkillRequest {
  name: string;
  type: "Softskill" | "Hardskill";
  category: string;
}

export interface UpdateSkillRequest {
  id: number; // Set in the route parameters
  name?: string;
  type?: "Softskill" | "Hardskill";
  category?: string;
}

export interface DeleteSkillRequest {
  id: number; // Set in the route parameters
}

export interface GetAllSkillsRequest {}

export interface GetSkillByIdRequest {
  id: number; // Set in the route parameters
}

export interface GetSkillsByTypeRequest {
  type: "Softskill" | "Hardskill"; // Set in the route parameters
}

export interface GetSkillsByCategoryRequest {
  category: string; // Set in the route parameters
}
