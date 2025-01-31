/**
 * Education repository interface.
 */
export default interface IEducationRepository {
  /**
   * Retrieves all educations
   */
  getAll(): Promise<
    {
      id: number;
      domain: string;
      diploma: string;
    }[]
  >;

  /**
   * Retrieves an education by its id
   * @param id The id of the education to retrieve
   */
  getById(id: number): Promise<{
    id: number;
    domain: string;
    diploma: string;
  }>;

  /**
   * Retrieves all domains
   */
  getAllDomains(): Promise<string[]>;

  /**
   * Retrieves all diplomas
   */
  getAllDiplomas(): Promise<string[]>;

  /**
   * Retrieves diplomas by domain
   * @param domain The domain to retrieve diplomas for
   */
  getDiplomasByDomain(domain: string): Promise<string[]>;

  /**
   * Creates an education
   * @param domain The domain of the education
   * @param diploma The diploma of the education
   */
  create(
    domain: string,
    diploma: string
  ): Promise<{
    id: number;
    domain: string;
    diploma: string;
  }>;

  /**
   * Updates an education
   * @param id The id of the education to update
   * @param domain The new domain of the education
   * @param diploma The new diploma of the education
   */
  update(id: number, domain?: string, diploma?: string): Promise<void>;

  /**
   * Deletes an education
   * @param id The id of the education to delete
   */
  delete(id: number): Promise<void>;
}
