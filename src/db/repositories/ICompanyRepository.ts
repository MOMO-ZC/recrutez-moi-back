import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { companiesTable, companyUsersTable, usersTable } from "../schema";

type Company = InferSelectModel<typeof companiesTable>;
type CompanyInsert = InferInsertModel<typeof companiesTable>;

type CompanyUser = InferSelectModel<typeof companyUsersTable>;
type CompanyUserInsert = InferInsertModel<typeof companyUsersTable>;

/**
 * Interface for Company Repository
 */
export default interface ICompanyRepository {
  /**
   * Add a company to the database.
   * @param company The company to add to the database
   */
  add(company: Omit<CompanyUserInsert, "company">): Promise<CompanyUser | null>;

  /**
   * Find a company by its ID.
   * @param id The ID of the company to find
   */
  findById(id: number): Promise<Company | null>;

  /**
   * Find a company by the ID of their user.
   * @param id The ID of the user associated with the company to find
   */
  findByUserId(id: number): Promise<CompanyUser | null>;

  /**
   * Retrieves the user associated with a company
   * @param id_company The ID of the company
   */
  findUser(
    id_company: number
  ): Promise<InferSelectModel<typeof usersTable> | null>;

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
  updateFromUserID({
    user,
    company,
  }: {
    user: number;
    company: Partial<Omit<CompanyUser, "user">>;
  }): Promise<null>;

  /**
   * Update a company and its associated user in the database.
   * @param id The ID of the company to update
   * @param fullUser The full user object to update with
   */
  updateWithUser({
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
  }): Promise<null>;
}
