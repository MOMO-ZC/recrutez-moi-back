export interface GetSkillResponse {
  id: number;
  name: string;
  type: "Softskill" | "Hardskill";
  category: string;
}

export interface GetSkillsResponse {
  skills: GetSkillResponse[];
}

export interface DeleteSkillResponse {}
