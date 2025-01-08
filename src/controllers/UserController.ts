import "dotenv/config";
import bcrypt from "bcrypt";
import { LogInRequest, RegisterRequest } from "../requests/UserRequests";
import UserRepository from "../db/repositories/UserRepository";
import { UserCreationError } from "../exceptions/UserExceptions";

const userRepository = new UserRepository();

export const register = async (request: RegisterRequest): Promise<number> => {
  // Hash the password
  const hashedPassword = await bcrypt.hash(request.password, 10);

  // Create the new user
  const newUser = await userRepository.add({
    email: request.email,
    firstname: request.firstname,
    lastname: request.lastname,
    phone: request.phone,
    password: hashedPassword,
    birthdate: request.birthdate ? new Date(request.birthdate) : null,
    created_at: new Date(),
    modified_at: new Date(),
  });

  // Check if the user has been added to the database
  if (!newUser) {
    throw new UserCreationError();
  }

  // Return the id of the new user
  // TODO: Return a JWT instead
  return newUser.id;
};

export const logIn = async (request: LogInRequest): Promise<boolean> => {
  // Get the user
  const user = await userRepository.findByEmail(request.email);

  // User not found
  if (!user) return false;

  // Compare the password with the hashed password
  return await bcrypt.compare(request.password, user.password);
};
