import { companyUsersTable, usersTable } from "../db/schema";
import { InferInsertModel } from "drizzle-orm";

export interface UpdateCompanyRequest
  extends Partial<Omit<InferInsertModel<typeof companyUsersTable>, "user">>,
    Partial<
      Omit<InferInsertModel<typeof usersTable>, "created_at" | "modified_at">
    > {
  id: number;
}
