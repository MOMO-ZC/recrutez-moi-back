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
