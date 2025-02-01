export interface GetEducationResponse {
  id: number;
  domain: string;
  diploma: string;
}

export interface UpdateEducationResponse {}

export interface DeleteEducationResponse {}

export interface GetEducationsResponse {
  educations: {
    id: number;
    domain: string;
    diploma: string;
  }[];
}

export interface GetDomainsResponse {
  domains: string[];
}

export interface GetDiplomasResponse {
  diplomas: string[];
}
