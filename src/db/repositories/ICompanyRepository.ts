import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { companyUsersTable, usersTable } from "../schema";

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
  add(company: Omit<CompanyInsert, "company">): Promise<Company | null>;

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

  /**
   * Update a company in the database.
   * @param user The ID of the user associated with the company
   * @param company The fields to update on the company
   */
  update({
    user,
    company,
  }: {
    user: number;
    company: Partial<Omit<Company, "user">>;
  }): Promise<null>;

  /**
   * Update a company and its associated user in the database.
   * @param id The ID of the company to update
   * @param fullUser The full user object to update with
   */
  updateWithUser({
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
  }): Promise<null>;
}
