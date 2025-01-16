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
}
