import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import ICompanyRepository from "./ICompanyRepository";
import { companiesTable, companyUsersTable, usersTable } from "../schema";
import { db } from "..";
import { createInsertSchema } from "drizzle-zod";

type Company = InferSelectModel<typeof companiesTable>;
type CompanyInsert = InferInsertModel<typeof companiesTable>;
type CompanyUser = InferSelectModel<typeof companyUsersTable>;
type CompanyUserInsert = InferInsertModel<typeof companyUsersTable>;

export default class CompanyRepository implements ICompanyRepository {
  async add(
    company: Omit<CompanyUserInsert, "company">
  ): Promise<CompanyUser | null> {
    // Add company profile
    const companyProfile = (
      await db
        .insert(companiesTable)
        .values({
          name: company.name,
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
        })
        .returning()
    )[0];

    // Add company user
    return (
      await db
        .insert(companyUsersTable)
        .values({ company: companyProfile.id, ...company })
        .returning()
    )[0];
  }

  async findById(id: number): Promise<Company | null> {
    return (
      await db.select().from(companiesTable).where(eq(companiesTable.id, id))
    )[0];
  }

  async findByUserId(
    id: number
  ): Promise<{ company: number; name: string; user: number } | null> {
    return (
      await db
        .select()
        .from(companyUsersTable)
        .where(eq(companyUsersTable.user, id))
    )[0];
  }

  async findUser(
    id_company: number
  ): Promise<InferSelectModel<typeof usersTable>> {
    const result = (
      await db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          password: usersTable.password,
          role: usersTable.role,
          created_at: usersTable.created_at,
          modified_at: usersTable.modified_at,
        })
        .from(usersTable)
        .innerJoin(companyUsersTable, eq(usersTable.id, companyUsersTable.user))
        .where(eq(companyUsersTable.company, id_company))
    )[0];
    return result;
  }

  async remove(id: number): Promise<null> {
    await db.delete(companyUsersTable).where(eq(companyUsersTable.user, id));
    return null;
  }

  async updateFromUserID({
    user,
    company,
  }: {
    user: number;
    company: Partial<Omit<CompanyUser, "user">>;
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
    id_company,
    id_user,
    fullUser,
  }: {
    id_company: number;
    id_user: number;
    fullUser: Partial<
      Omit<CompanyUser, "user"> &
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
        .where(eq(usersTable.id, id_user));

      // Update candidate_users table
      const candidate_user = (
        await tx
          .update(companyUsersTable)
          .set(candidateUpdateData)
          .where(eq(companyUsersTable.user, id_user))
          .returning()
      )[0];

      // Update company table
      if (candidateUpdateData.name)
        await tx
          .update(companiesTable)
          .set({
            name: candidateUpdateData.name,
            modified_at: new Date().toISOString(),
          })
          .where(eq(companiesTable.id, candidate_user.company));
    });
    return null;
  }
}
