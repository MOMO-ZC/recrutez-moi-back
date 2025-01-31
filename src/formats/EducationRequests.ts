export interface CreateEducationRequest {
  domain: string;
  diploma: string;
}

export interface UpdateEducationRequest {
  id: number; // Set in the route parameters
  domain?: string;
  diploma?: string;
}

export interface DeleteEducationRequest {
  id: number; // Set in the route parameters
}

export interface GetEducationByIdRequest {
  id: number; // Set in the route parameters
}

export interface GetAllEducationsRequest {}

export interface GetAllDomainsRequest {}

export interface GetAllDiplomasRequest {}

export interface GetDiplomasByDomainRequest {
  domain: string; // Set in the route parameters
}
