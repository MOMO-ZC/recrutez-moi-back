import { candidateUsersTable, usersTable } from "../db/schema";
import { InferInsertModel } from "drizzle-orm";

export interface AboutCandidateRequest {
  id: number;
  userId: number; // Set by the authentication middleware | The id of the user making the request. Can be a candidate or a company
  userRole: string; // Set by the authentication middleware | The role of the user making the request. Can be a candidate or a company
}

export interface UpdateCandidateRequest
  extends Partial<Omit<InferInsertModel<typeof candidateUsersTable>, "user">>,
    Partial<
      Omit<
        InferInsertModel<typeof usersTable>,
        "created_at" | "modified_at" | "role"
      >
    > {
  id: number;
  userId: number; // Set by the authentication middleware | The id of the user making the request. Can only be a candidate
}

export interface AddCandidateExistingEducationRequest {
  // id_user: number; // Set by the authentication middleware | The id of the user making the request. Can only be a candidate
  id_candidate: number;
  id_education: number;
  school: string;
  start: Date;
  end: Date;
}

export interface AddCandidateNewEducationRequest {
  // id_user: number; // Set by the authentication middleware | The id of the user making the request. Can only be a candidate
  id_candidate: number;
  school: string;
  diploma: string;
  domain: string;
  start: Date;
  end: Date;
}

export interface GetCandidateEducationsRequest {
  id_candidate: number; // Set in the route parameters
}

export interface DeleteCandidateEducationRequest {
  id_candidate: number;
  id_education: number;
}

export interface AddExperienceRequest {
  id_candidate: number;
  id_experience: number;
  description: string;
  start: Date;
  end: Date;
}

export interface UpdateExperienceRequest {
  id_candidate: number; // Set in the route parameters
  id_experience: number; // Set in the route parameters
  name?: string; // Will chage the id_experience if specified to match with the correct one.
  description?: string;
  start?: Date;
  end?: Date;
}

export interface GetExperienceRequest {
  id_candidate: number; // Set in the route parameters
  id_experience: number; // Set in the route parameters
}

export interface GetExperiencesRequest {
  id_candidate: number; // Set in the route parameters
}

export interface DeleteCandidateExperienceRequest {
  id_candidate: number; // Set in the route parameters
  id_experience: number; // Set in the route parameters
}
