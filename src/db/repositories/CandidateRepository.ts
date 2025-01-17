import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import ICandidateRepository from "./ICandidateRepository";
import { candidateUsersTable, usersTable } from "../schema";
import { db } from "..";
import { createInsertSchema } from "drizzle-zod";

type Candidate = InferSelectModel<typeof candidateUsersTable>;
type CandidateInsert = InferInsertModel<typeof candidateUsersTable>;

export default class CandidateRepository implements ICandidateRepository {
  async add(candidate: CandidateInsert): Promise<Candidate | null> {
    return (
      await db.insert(candidateUsersTable).values(candidate).returning()
    )[0];
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    return (
      await db
        .select()
        .from(candidateUsersTable)
        .leftJoin(usersTable, eq(usersTable.id, candidateUsersTable.user))
        .where(eq(usersTable.email, email))
    )[0].candidate_users;
  }

  async findById(id: number): Promise<Candidate | null> {
    return (
      await db
        .select()
        .from(candidateUsersTable)
        .where(eq(candidateUsersTable.user, id))
    )[0];
  }

  async remove(id: number): Promise<null> {
    await db
      .delete(candidateUsersTable)
      .where(eq(candidateUsersTable.user, id));
    return null;
  }

  async update({
    user,
    candidate,
  }: {
    user: number;
    candidate: Partial<Omit<Candidate, "user">>;
  }): Promise<null> {
    await db.transaction(async (tx) => {
      // Update the modified_at date in the users table
      await tx
        .update(usersTable)
        .set({ modified_at: new Date() })
        .where(eq(usersTable.id, user));

      // Update candidate_users table
      await tx
        .update(candidateUsersTable)
        .set(candidate)
        .where(eq(candidateUsersTable.user, user));
    });
    return null;
  }

  async updateWithUser({
    id,
    fullUser,
  }: {
    id: number;
    fullUser: Partial<
      Omit<Candidate, "user"> &
        Partial<
          Omit<
            InferSelectModel<typeof usersTable>,
            "id" | "created_at" | "modified_at"
          >
        >
    >;
  }): Promise<null> {
    // Filter fields
    const userSchema = createInsertSchema(usersTable);
    const userUpdateData = userSchema.partial().parse(fullUser);

    const candidateSchema = createInsertSchema(candidateUsersTable);
    const candidateUpdateData = candidateSchema.partial().parse(fullUser);

    await db.transaction(async (tx) => {
      // Update users table
      await tx
        .update(usersTable)
        .set({ ...userUpdateData, modified_at: new Date() })
        .where(eq(usersTable.id, id));

      // Update candidate_users table
      await tx
        .update(candidateUsersTable)
        .set(candidateUpdateData)
        .where(eq(candidateUsersTable.user, id));
    });
    return null;
  }
}
