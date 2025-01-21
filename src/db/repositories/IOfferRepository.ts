import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { jobOffersTable } from "../schema";

type Offer = InferSelectModel<typeof jobOffersTable>;
type OfferInsert = InferInsertModel<typeof jobOffersTable>;

/**
 * Interface defining the contract for interacting with the Offer repository.
 * Provides CRUD operations for managing offer entities in the database.
 */
export default interface IOfferRepository {
  /**
   * Creates a new offer in the repository
   * @param offer The offer to create, excluding created_at and modified_at fields
   * @returns Promise that resolves to the created Offer
   * @throws {Error} If the offer creation fails
   */
  create(
    offer: Omit<OfferInsert, "created_at" | "modified_at">
  ): Promise<Offer>;

  /**
   * Updates an existing offer in the repository
   * @param offer Partial offer data to update, excluding created_at and modified_at fields
   * @returns Promise that resolves to the updated Offer
   * @throws {Error} If the offer update fails or offer not found
   */
  update(
    offer: Partial<Omit<OfferInsert, "created_at" | "modified_at">>
  ): Promise<Offer>;

  /**
   * Deletes an offer from the repository
   * @param id The id of the offer to delete
   */
  delete(id: number): Promise<null>;

  /**
   * Retrieves an offer from the repository by its id
   * @param id The id of the offer to retrieve
   * @returns The corresponding offer
   */
  getById(id: number): Promise<Offer>;

  /**
   * Retrieves all offers from the repository
   * @returns A list of all offers
   */
  getAll(): Promise<Offer[]>;
}
