import { and, eq, InferSelectModel } from "drizzle-orm";
import { applicationsTable } from "../schema";
import IApplicationRepository from "./IApplicationRepository";
import { db } from "..";

export default class ApplicationRepository implements IApplicationRepository {
  async getApplicationById(
    id: number
  ): Promise<InferSelectModel<typeof applicationsTable>> {
    return (
      await db
        .select()
        .from(applicationsTable)
        .where(eq(applicationsTable.id, id))
    )[0];
  }

  async getApplicationsForUser(
    userId: number
  ): Promise<InferSelectModel<typeof applicationsTable>[]> {
    return await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id_user, userId));
  }

  async rejectApplication(id: number): Promise<void> {
    await db
      .update(applicationsTable)
      .set({ status: "rejected" })
      .where(eq(applicationsTable.id, id));
  }

  async acceptApplication(id: number): Promise<void> {
    await db
      .update(applicationsTable)
      .set({ status: "offered" })
      .where(eq(applicationsTable.id, id));
  }

  async rejectAllPendingApplications(id_offer: number): Promise<void> {
    await db
      .update(applicationsTable)
      .set({ status: "rejected" })
      .where(
        and(
          eq(applicationsTable.id_job_offer, id_offer),
          eq(applicationsTable.status, "pending")
        )
      );
  }
}
