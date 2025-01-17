import { candidateUsersTable, usersTable } from "../db/schema";
import { InferInsertModel } from "drizzle-orm";

export interface UpdateCandidateRequest
  extends Partial<Omit<InferInsertModel<typeof candidateUsersTable>, "user">>,
    Partial<
      Omit<
        InferInsertModel<typeof usersTable>,
        "created_at" | "modified_at" | "role"
      >
    > {
  id: number;
}
