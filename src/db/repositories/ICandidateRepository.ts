import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { candidateUsersTable, usersTable } from "../schema";

type Candidate = InferSelectModel<typeof candidateUsersTable>;
type CandidateInsert = InferInsertModel<typeof candidateUsersTable>;

/**
 * Interface for Candidate Repository
 */
export default interface ICandidateRepository {
  /**
   * Add a candidate to the database.
   * @param candidate The candidate to add to the database
   */
  add(candidate: CandidateInsert): Promise<Candidate | null>;

  /**
   * Find a candidate by the email of their associated user.
   * @param email The email of the user of the candidate to find
   */
  findByEmail(email: string): Promise<Candidate | null>;

  /**
   * Find a candidate by their ID.
   * @param id The ID of the candidate to find
   */
  findById(id: number): Promise<Candidate | null>;

  /**
   * Remove a candidate from the database.
   * @param id The ID of the candidate to remove
   */
  remove(id: number): Promise<null>;

  /**
   * Update a candidate in the database.
   * @param user The ID of the user associated with the candidate
   * @param candidate The fields to update on the candidate
   */
  update({
    user,
    candidate,
  }: {
    user: number;
    candidate: Partial<Omit<Candidate, "user">>;
  }): Promise<null>;

  /**
   * Update a candidate and its associated user in the database.
   * @param id The ID of the candidate to update
   * @param fullUser The full user object to update with
   */
  updateWithUser({
    id,
    fullUser,
  }: {
    id: number;
    fullUser: Partial<
      Omit<Candidate, "user"> &
        Partial<
          Omit<
            InferSelectModel<typeof usersTable>,
            "id" | "created_at" | "modified_at" | "role"
          >
        >
    >;
  }): Promise<null>;

  /**
   * Add an education to a candidate
   * @param id_candidate The ID of the candidate
   * @param id_eduaction The ID of the education
   * @param
   */
  addEducation(
    id_candidate: number,
    id_education: number,
    school: string,
    start: Date,
    end: Date
  ): Promise<{
    education: {
      id: number;
      domain: string;
      diploma: string;
    };
    id_user: number;
    school: string;
    start: Date;
    end: Date;
    created_at: Date;
    modified_at: Date;
  }>;

  /**
   * Retrieves the list of a candidate's educations
   * @param id_candidate The ID of the candidate
   */
  getCandidateEducations(id_candidate: number): Promise<{
    candidate_educations: {
      education: {
        id: number;
        domain: string;
        diploma: string;
      };
      school: string;
      start: Date;
      end: Date;
      created_at: Date;
      modified_at: Date;
    }[];
  }>;

  /**
   * Check if an education has already been linked to the profile of a candidate
   * @param id_candidate The ID of the candidate
   * @param id_education The Id of the education
   */
  educationExists(id_candidate: number, id_education: number): Promise<boolean>;

  /**
   * Update an education
   * @param id_candidate The ID of the candidate
   * @param id_education The ID of the education
   * @param school The new school value
   * @param start The new start date
   * @param end The new end date
   */
  updateEducation(
    id_candidate: number,
    id_education: number,
    school?: string,
    start?: Date,
    end?: Date
  ): Promise<void>;

  /**
   * Delete an education
   * @param id_candidate The ID of the candidate
   * @param id_education The ID of the education
   */
  DeleteEducation(id_candidate: number, id_education: number): Promise<void>;
}
