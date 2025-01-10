import "dotenv/config";
import bcrypt from "bcrypt";
import { LogInRequest, RegisterRequest } from "../formats/UserRequests";
import UserRepository from "../db/repositories/UserRepository";
import { UserCreationError } from "../exceptions/UserExceptions";
import { TokenProvider } from "../providers/TokenProvider";
import { LogInResponse, RegisterResponse } from "../formats/UserResponses";

const userRepository = new UserRepository();

export const register = async (
  request: RegisterRequest
): Promise<RegisterResponse> => {
  // Check if a user already uses the email address
  const existingUser = await userRepository.findByEmail(request.email);
  if (existingUser) {
    throw new UserCreationError("Email already in use");
  }

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

  // Return a user token to keep them logged in
  const tokenProvider = new TokenProvider();
  const token = tokenProvider.sign({ id: newUser.id, role: undefined }); // TODO: Add roles later...

  const response: RegisterResponse = { token: token };
  return response;
};

export const logIn = async (
  request: LogInRequest
): Promise<LogInResponse | null> => {
  // Get the user
  const user = await userRepository.findByEmail(request.email);

  // User not found
  if (!user) return null;

  // Compare the password with the hashed password
  if (!(await bcrypt.compare(request.password, user.password))) {
    return null;
  }

  const tokenProvider = new TokenProvider();
  const token = tokenProvider.sign({ id: user.id, role: undefined }); // TODO: Add roles later...

  const response: LogInResponse = { token: token };
  return response;
};