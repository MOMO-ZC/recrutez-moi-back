import {IUserRepository} from "./IUserRepository";
import {db} from "../";
import {usersTable} from "../schema";
import {InferInsertModel, InferSelectModel, eq} from "drizzle-orm";

type User = InferSelectModel<typeof usersTable>;

/**
 * UserRepository class that implements IUserRepository interface.
 * Provides methods to interact with user data in the database.
 */
export default class UserRepository implements IUserRepository {
  async add(user: InferInsertModel<typeof usersTable>): Promise<User | null> {
    return (await db.insert(usersTable).values(user).returning())[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email))
    return user[0];
  }

  async findById(id: number): Promise<User | null> {
    return (await db.select().from(usersTable).where(eq(usersTable.id, id)))[0];
  }

  async remove(id: number): Promise<null> {
    await db.delete(usersTable).where(eq(usersTable.id, id));
    return null;
  }

  async update(
    userId: number,
    fields: Partial<InferInsertModel<typeof usersTable>>
  ): Promise<null> {
    await db.update(usersTable).set(fields).where(eq(usersTable.id, userId));
    return null;
  }
}
