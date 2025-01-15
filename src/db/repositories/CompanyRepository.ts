import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import ICompanyRepository from "./ICompanyRepository";
import { companyUsersTable } from "../schema";
import { db } from "..";

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
}
