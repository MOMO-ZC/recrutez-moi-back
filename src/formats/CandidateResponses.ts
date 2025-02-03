export interface AboutCandidateResponse {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
  address?: string;
  birthdate: string;
  lookingForTitle?: string;
  lookingForExperience?: number;
  languages?: {
    id: number;
    name: string;
    level: string;
  }[];
  hobbies?: { name: string }[];
}

export interface GetCandidateEducationResponse {
  education: {
    id: number;
    domain: string;
    diploma: string;
  };
  school: string;
  start: Date;
  end: Date;
  created_at: Date;
  modified_at: Date;
}

export interface GetCandidateEducationsResponse {
  candidate_educations: {
    education: {
      id: number;
      domain: string;
      diploma: string;
    };
    school: string;
    start: Date;
    end: Date;
    created_at: Date;
    modified_at: Date;
  }[];
}

export interface GetExperienceResponse {
  id: number;
  name: string;
  description: string;
  start: Date;
  end: Date;
  created_at: Date;
  modified_at: Date;
}
