export interface AboutCandidateResponse {
  id: number;
  firstname: string;
  lastname: string;
  phone?: string;
  address?: string;
  birthdate: string;
  lookingForTitle?: string;
  lookingForExperience?: number;
}
