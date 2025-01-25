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
