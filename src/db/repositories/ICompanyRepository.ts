import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { companyUsersTable } from "../schema";

type Company = InferSelectModel<typeof companyUsersTable>;
type CompanyInsert = InferInsertModel<typeof companyUsersTable>;

/**
 * Interface for Company Repository
 */
export default interface ICompanyRepository {
  /**
   * Add a company to the database.
   * @param company The company to add to the database
   */
  add(company: CompanyInsert): Promise<Company | null>;

  /**
   * Find a company by their ID.
   * @param id The ID of the company to find
   */
  findById(id: number): Promise<Company | null>;

  /**
   * Remove a company from the database.
   * @param id The ID of the company to remove
   */
  remove(id: number): Promise<null>;
}
