import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import ICandidateRepository from "./ICandidateRepository";
import { candidateUsersTable, usersTable } from "../schema";
import { db } from "..";

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
}
