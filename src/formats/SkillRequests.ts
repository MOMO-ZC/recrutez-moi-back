export interface CreateSkillRequest {
  name: string;
  type: "Softskill" | "Hardskill";
  category: string;
}

export interface UpdateSkillRequest {
  id: number;
  name?: string;
  type?: "Softskill" | "Hardskill";
  category?: string;
}

export interface DeleteSkillRequest {
  id: number;
}

export interface GetAllSkillsRequest {}

export interface GetSkillByIdRequest {
  id: number;
}

export interface GetSkillsByTypeRequest {
  type: "Softskill" | "Hardskill";
}

export interface GetSkillsByCategoryRequest {
  category: string;
}
