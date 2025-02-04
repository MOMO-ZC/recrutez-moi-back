export interface GetExperienceResponse {
  id: number;
  name: string;
  skills: {
    id: number;
    name: string;
    type: string;
    category: string;
    created_at: Date;
    modified_at: Date;
  }[];
}
