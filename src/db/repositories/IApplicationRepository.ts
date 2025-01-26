import { InferSelectModel } from "drizzle-orm";
import { applicationsTable } from "../schema";

export default interface IApplicationRepository {
  /**
   * Retreieves an application by its id
   * @param id The id of the application
   */
  getApplicationById(
    id: number
  ): Promise<InferSelectModel<typeof applicationsTable>>;

  /**
   * Retrieves all the applications for a specific user
   * @param userId The id of the user
   */
  getApplicationsForUser(
    userId: number
  ): Promise<InferSelectModel<typeof applicationsTable>[]>;

  /**
   * Rejects an application by its id
   * @param id The id of the application
   */
  rejectApplication(id: number): Promise<void>;

  /**
   * Accepts an application by its id
   * @param id The id of the application
   */
  acceptApplication(id: number): Promise<void>;

  /**
   * Rejects all applications that are pending for a specific offer
   * @param id_offer The id of the offer containing the applications
   */
  rejectAllPendingApplications(id_offer: number): Promise<void>;
}
