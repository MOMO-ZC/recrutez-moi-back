export default interface IExperienceRepository {
  /**
   * Create a new experience
   * @param name The name of the experience
   */
  createExperience(
    name: string,
    skills?: number[]
  ): Promise<{
    id: number;
    name: string;
    skills: {
      id: number;
      name: string;
      type: string;
      category: string;
      created_at: Date;
      modified_at: Date;
    }[];
  }>;

  /**
   * Updates an experience
   * @param id The id of the experience to update
   * @param name The new name of the experience
   */
  updateExperience(
    id: number,
    name?: string,
    skills?: number[]
  ): Promise<{
    id: number;
    name: string;
    skills: {
      id: number;
      name: string;
      type: string;
      category: string;
      created_at: Date;
      modified_at: Date;
    }[];
  }>;

  /**
   * Deletes an experience
   * @param id The id of the experience to delete
   */
  deleteExperience(id: number): Promise<void>;

  /**
   * Retrieves an experience by its id
   * @param id The id of the experience to get
   */
  getExperienceById(id: number): Promise<{
    id: number;
    name: string;
    skills: {
      id: number;
      name: string;
      type: string;
      category: string;
      created_at: Date;
      modified_at: Date;
    }[];
  }>;

  /**
   * Retrieves all experiences
   */
  getAllExperiences(): Promise<{
    experiences: {
      id: number;
      name: string;
      skills: {
        id: number;
        name: string;
        type: string;
        category: string;
        created_at: Date;
        modified_at: Date;
      }[];
    }[];
  }>;
}
