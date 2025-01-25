import { companyUsersTable, usersTable } from "../db/schema";
import { InferInsertModel } from "drizzle-orm";

export interface AboutCompanyRequest {
  id: number;
}

export interface UpdateCompanyRequest
  extends Partial<Omit<InferInsertModel<typeof companyUsersTable>, "user">>,
    Partial<
      Omit<
        InferInsertModel<typeof usersTable>,
        "created_at" | "modified_at" | "role"
      >
    > {
  id: number;
  userId: number; // Set by the authentication middleware | The id of the user making the request.
}
