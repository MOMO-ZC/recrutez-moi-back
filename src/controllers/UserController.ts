import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { LogInRequest, RegisterRequest } from "../requests/UserRequests";

export const register = async (request: RegisterRequest): Promise<number> => {
  try {
    const hashedPassword = await bcrypt.hash(request.password, 10);

    const result = await db
      .insert(usersTable)
      .values({
        email: request.email,
        firstname: request.firstname,
        lastname: request.lastname,
        phone: request.phone,
        password: hashedPassword,
        birthdate: request.birthdate ? new Date(request.birthdate) : null,
        created_at: new Date(),
        modified_at: new Date(),
      } as any)
      .returning(usersTable.id as any);

    return result[0].id as number;
  } catch (error) {
    throw new Error(error as string); // TODO: Implement custom exception
  }
};

export const logIn = async (request: LogInRequest): Promise<boolean> => {
  try {
    const result = await db
      .select({ hashedPassword: usersTable.password })
      .from(usersTable)
      .where(eq(usersTable.email, request.email));

    if (!result || result.length === 0) {
      return false;
    }

    if (!result[0].hashedPassword) {
      return false;
    }

    return await bcrypt.compare(request.password, result[0].hashedPassword);
  } catch (error) {
    throw new Error(error as string); // TODO: Implement custom exception
  }
};
