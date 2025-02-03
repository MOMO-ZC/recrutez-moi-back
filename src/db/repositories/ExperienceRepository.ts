import { db } from "..";
import { experiencesTable } from "../schema";
import IExperienceRepository from "./IExperienceRepository";
import { eq } from "drizzle-orm";

/**
 * A repository for experiences
 */
export default class ExperienceRepository implements IExperienceRepository {
  async createExperience(name: string): Promise<{ id: number; name: string }> {
    return (await db.insert(experiencesTable).values({ name }).returning())[0];
  }

  async updateExperience(
    id: number,
    name?: string
  ): Promise<{ id: number; name: string }> {
    return (await db.update(experiencesTable).set({ name }).returning())[0];
  }

  async deleteExperience(id: number): Promise<void> {
    await db.delete(experiencesTable).where(eq(experiencesTable.id, id));
  }

  async getExperienceById(id: number): Promise<{ id: number; name: string }> {
    return (
      await db
        .select()
        .from(experiencesTable)
        .where(eq(experiencesTable.id, id))
    )[0];
  }

  async getAllExperiences(): Promise<{
    experiences: { id: number; name: string }[];
  }> {
    return { experiences: await db.select().from(experiencesTable) };
  }
}
