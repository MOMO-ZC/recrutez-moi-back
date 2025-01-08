import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { usersTable } from "../schema";

type User = InferSelectModel<typeof usersTable>;

/**
 * Interface representing a user repository.
 * Provides methods to interact with the user data in the database.
 */
export interface IUserRepository {
  /**
   * Add a user to the database.
   * @param user The user to add to the database
   */
  add(user: InferInsertModel<typeof usersTable>): Promise<User | null>;

  /**
   * Find a user by their email.
   * @param email The email of the user to find
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by their ID.
   * @param id The ID of the user to find
   */
  findById(id: number): Promise<User | null>;
}
