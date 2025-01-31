import { companyUsersTable, usersTable } from "../db/schema";
import { InferInsertModel } from "drizzle-orm";

export interface AboutCompanyRequest {
  id: number; // Set in the route parameters
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
  companyLoginId: number; // Set by the authentication middleware | The id of the company associated with the user making the request.
}
