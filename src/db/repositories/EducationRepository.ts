import { db } from "..";
import { educationsTable } from "../schema";
import IEducationRepository from "./IEducationRepository";
import { eq } from "drizzle-orm";

export default class EducationRepository implements IEducationRepository {
  async getAll(): Promise<{ id: number; domain: string; diploma: string }[]> {
    return await db.select().from(educationsTable);
  }

  async getById(
    id: number
  ): Promise<{ id: number; domain: string; diploma: string }> {
    return (
      await db.select().from(educationsTable).where(eq(educationsTable.id, id))
    )[0];
  }

  async getAllDomains(): Promise<string[]> {
    return (
      await db
        .selectDistinct({ domain: educationsTable.domain })
        .from(educationsTable)
    ).map((row) => row.domain);
  }

  async getAllDiplomas(): Promise<string[]> {
    return (
      await db
        .selectDistinct({ diploma: educationsTable.diploma })
        .from(educationsTable)
    ).map((row) => row.diploma);
  }

  async getDiplomasByDomain(domain: string): Promise<string[]> {
    return (
      await db
        .selectDistinct({ diploma: educationsTable.diploma })
        .from(educationsTable)
        .where(eq(educationsTable.domain, domain))
    ).map((row) => row.diploma);
  }

  async create(
    domain: string,
    diploma: string
  ): Promise<{ id: number; domain: string; diploma: string }> {
    return (
      await db.insert(educationsTable).values({ domain, diploma }).returning()
    )[0];
  }

  async update(id: number, domain?: string, diploma?: string): Promise<void> {
    await db
      .update(educationsTable)
      .set({ domain, diploma })
      .where(eq(educationsTable.id, id));
  }

  async delete(id: number): Promise<void> {
    await db.delete(educationsTable).where(eq(educationsTable.id, id));
  }
}
