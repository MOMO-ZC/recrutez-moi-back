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
    userId: number,
    offer: Omit<OfferInsert, "id_company" | "created_at" | "modified_at">
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
   * Updates an existing offer in the repository along with the skills, eduaction, experiences and languages linked to it.
   * @param offer The offer to update
   */
  updateWithLinks(
    offer: Partial<
      Omit<Offer, "created_at" | "modified_at"> & {
        skills: number[];
        education: number[];
        experiences: number[];
        languages: { id: number; level: string }[];
      }
    >
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
  getById(id: number): Promise<
    Offer & {
      skills: { id: number; name: string; type: string; category: string }[];
      education: { id: number; domain: string; diploma: string }[];
      experiences: { id: number; name: string }[];
      languages: { id: number; name: string; level: string }[];
    }
  >;

  /**
   * Retrieves all offers from the repository for a specific company
   * @param id_company The id of the company to get offers for
   */
  getByCompany(id_company: number): Promise<
    (Offer & {
      company_name: string;
      number_applicants: number;
      skills: { id: number; name: string; type: string; category: string }[];
      education: { id: number; domain: string; diploma: string }[];
      experiences: { id: number; name: string }[];
      languages: { id: number; name: string; level: string }[];
    })[]
  >;

  /**
   * Retrieves all offers from the repository
   * @returns A list of all offers
   */
  getAll(): Promise<
    (Offer & {
      skills: { id: number; name: string; type: string; category: string }[];
      education: { id: number; domain: string; diploma: string }[];
      experiences: { id: number; name: string }[];
      languages: { id: number; name: string; level: string }[];
    })[]
  >;

  /**
   * Retrieves all offers from the repository and whether the user liked them or not
   * @param userId The id of the user to get offers for
   */
  getAllWithLiked(userId: number): Promise<
    (Offer & {
      liked: boolean;
      company_name: string;
      applied: boolean;
      skills: { id: number; name: string; type: string; category: string }[];
      education: { id: number; domain: string; diploma: string }[];
      experiences: { id: number; name: string }[];
      languages: { id: number; name: string; level: string }[];
    })[]
  >;
  /**
   * Adds skills to an offer
   * @param offerId The id of the offer to add skills to
   * @param skills The ids of the skills to add to the offer
   */
  addSkills(offerId: number, skills: number[]): Promise<null>;

  /**
   * Adds education requirements to an offer
   * @param offerId The id of the offer to add education requirements to
   * @param education The ids of the education requirements to add to the offer
   */
  addEducation(offerId: number, education: number[]): Promise<null>;

  /**
   * Adds experiences to an offer
   * @param offerId The id of the offer to add experiences to
   * @param experiences The ids of the experiences to add to the offer
   */
  addExperiences(offerId: number, experiences: number[]): Promise<null>;

  /**
   * Adds languages to an offer
   * @param offerId The id of the offer to add languages to
   * @param languages The ids of the languages to add to the offer
   */
  addLanguages(
    offerId: number,
    languages: { id: number; level: string }[]
  ): Promise<null>;

  /**
   * Retrieves all offers that a user has liked
   * @param userId The id of the user to get liked offers for
   */
  getLiked(
    userId: number
  ): Promise<(Offer & { company_name: string; applied: boolean })[]>;

  /**
   * Returns whether a user has liked a specific offer
   * @param offerId The id of the offer
   * @param userId The id of the user
   * @returns True if the user has liked the offer, false otherwise
   */
  doesUserLike(offerId: number, userId: number): Promise<boolean>;

  /**
   * Likes an offer on behalf of a user
   * @param offerId The id of the offer to like
   * @param userId The id of the user liking the offer
   */
  like(offerId: number, userId: number): Promise<null>;

  /**
   * Unlikes an offer for a user
   * @param offerId The id of the offer to unlike
   * @param userId the id of the user unliking the offer
   */
  unlike(offerId: number, userId: number): Promise<null>;

  /**
   * Applies to an offer on behalf of a user
   * @param offerId The id of the offer to apply to
   * @param userId The id of the user applying to the offer
   */
  apply(offerId: number, userId: number): Promise<{ id: number }>;

  /**
   * Retrieves all applications for an offer
   * @param offerId The id of the offer to get applications for
   */
  getApplications(offerId: number): Promise<
    {
      id: number;
      id_user: number;
      userFullname: string;
      status: string;
      created_at: string;
      modified_at: string;
    }[]
  >;

  /**
   * Checks if a user has already applied to an offer
   * @param offerId The id of the offer
   * @param userId The id of the user
   * @returns True if the user has already applied, false otherwise
   */
  hasUserApplied(offerId: number, userId: number): Promise<boolean>;
}
