import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import ICompanyRepository from "./ICompanyRepository";
import { companyUsersTable, usersTable } from "../schema";
import { db } from "..";
import { createInsertSchema } from "drizzle-zod";

type Company = InferSelectModel<typeof companyUsersTable>;
type CompanyInsert = InferInsertModel<typeof companyUsersTable>;

export default class CompanyRepository implements ICompanyRepository {
  async add(company: CompanyInsert): Promise<Company | null> {
    return (await db.insert(companyUsersTable).values(company).returning())[0];
  }

  async findById(id: number): Promise<Company | null> {
    return (
      await db
        .select()
        .from(companyUsersTable)
        .where(eq(companyUsersTable.user, id))
    )[0];
  }

  async remove(id: number): Promise<null> {
    await db.delete(companyUsersTable).where(eq(companyUsersTable.user, id));
    return null;
  }

  async update({
    user,
    company,
  }: {
    user: number;
    company: Partial<Omit<Company, "user">>;
  }): Promise<null> {
    await db.transaction(async (tx) => {
      // Update the modified_at date in the users table
      await tx
        .update(usersTable)
        .set({ modified_at: new Date() })
        .where(eq(usersTable.id, user));

      // Update company_users table
      await tx
        .update(companyUsersTable)
        .set(company)
        .where(eq(companyUsersTable.user, user));
    });
    return null;
  }

  async updateWithUser({
    id,
    fullUser,
  }: {
    id: number;
    fullUser: Partial<
      Omit<Company, "user"> &
        Partial<
          Omit<
            InferSelectModel<typeof usersTable>,
            "id" | "created_at" | "modified_at" | "role"
          >
        >
    >;
  }): Promise<null> {
    // Filter fields
    const userSchema = createInsertSchema(usersTable);
    const userUpdateData = userSchema.partial().parse(fullUser);

    const candidateSchema = createInsertSchema(companyUsersTable);
    const candidateUpdateData = candidateSchema.partial().parse(fullUser);

    await db.transaction(async (tx) => {
      // Update users table
      await tx
        .update(usersTable)
        .set({ ...userUpdateData, modified_at: new Date() })
        .where(eq(usersTable.id, id));

      // Update candidate_users table
      await tx
        .update(companyUsersTable)
        .set(candidateUpdateData)
        .where(eq(companyUsersTable.user, id));
    });
    return null;
  }
}
