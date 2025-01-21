import { InferSelectModel, InferInsertModel, eq } from "drizzle-orm";
import { jobOffersTable } from "../schema";
import IOfferRepository from "./IOfferRepository";
import { db } from "..";

type Offer = InferSelectModel<typeof jobOffersTable>;
type OfferInsert = InferInsertModel<typeof jobOffersTable>;

export default class OfferRepository implements IOfferRepository {
  async create(
    offer: Omit<OfferInsert, "created_at" | "modified_at">
  ): Promise<Offer> {
    return (
      await db
        .insert(jobOffersTable)
        .values({
          ...offer,
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
        })
        .returning()
    )[0];
  }

  async update(
    offer: Partial<
      Omit<Offer, "id" | "id_company" | "created_at" | "modified_at">
    > & {
      id: number;
    }
  ): Promise<Offer> {
    const { id, ...updateFields } = offer;
    return (
      await db
        .update(jobOffersTable)
        .set({ ...updateFields, modified_at: new Date().toISOString() })
        .where(eq(jobOffersTable.id, id))
        .returning()
    )[0];
  }

  async delete(id: number): Promise<null> {
    await db.delete(jobOffersTable).where(eq(jobOffersTable.id, id));
    return null;
  }

  async getById(id: number): Promise<Offer> {
    return (
      await db.select().from(jobOffersTable).where(eq(jobOffersTable.id, id))
    )[0];
  }
  async getAll(): Promise<Offer[]> {
    return await db.select().from(jobOffersTable);
  }
}
