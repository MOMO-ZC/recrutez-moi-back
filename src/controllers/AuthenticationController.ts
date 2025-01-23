import "dotenv/config";
import bcrypt from "bcrypt";
import {
  LogInRequest,
  RegisterCandidateRequest,
  RegisterCompanyRequest,
} from "../formats/UserRequests";
import UserRepository from "../db/repositories/UserRepository";
import { UserCreationError } from "../exceptions/UserExceptions";
import { TokenProvider } from "../providers/TokenProvider";
import { LogInResponse, RegisterResponse } from "../formats/UserResponses";
import CandidateRepository from "../db/repositories/CandidateRepository";
import CompanyRepository from "../db/repositories/CompanyRepository";

const userRepository = new UserRepository();
const candidateRepository = new CandidateRepository();
const companyRepository = new CompanyRepository();

export const registerCandidate = async (
  request: RegisterCandidateRequest
): Promise<RegisterResponse> => {
  // Check if a user already uses the email address
  const existingUser = await userRepository.findByEmail(request.email);
  if (existingUser) {
    throw new UserCreationError("Email already in use");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(request.password, 10);

  // Create the new authentication user
  const newUser = await userRepository.add({
    email: request.email,
    password: hashedPassword,
    role: "candidate",
    created_at: new Date(),
    modified_at: new Date(),
  });

  // Check if the user has been added to the database
  if (!newUser) {
    throw new UserCreationError();
  }

  // Add the candidate user
  const newCandidate = await candidateRepository.add({
    user: newUser.id,
    firstname: request.firstname,
    lastname: request.lastname,
    birthdate:
      request.birthdate instanceof Date
        ? request.birthdate
        : new Date(request.birthdate),
    address: request.address,
  });

  // Check if the candidate has been added to the database
  if (!newCandidate) {
    // Remove the authentication user
    // TODO: Use transactions instead!
    await userRepository.remove(newUser.id);

    throw new UserCreationError();
  }

  // Return a user token to keep them logged in
  const tokenProvider = new TokenProvider();
  const token = tokenProvider.sign({ id: newUser.id, role: undefined }); // TODO: Add roles later...

  const response: RegisterResponse = { token: token };
  return response;
};

export const registerCompany = async (
  request: RegisterCompanyRequest
): Promise<RegisterResponse> => {
  // Check if a user already uses the email address
  const existingUser = await userRepository.findByEmail(request.email);
  if (existingUser) {
    throw new UserCreationError("Email already in use");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(request.password, 10);

  // Create the new authentication user
  let newUserData: {
    email: string;
    password: string;
    role: "candidate" | "company";
    created_at: Date;
    modified_at: Date;
  } = {
    email: request.email,
    password: hashedPassword,
    role: "company",
    created_at: new Date(),
    modified_at: new Date(),
  };

  const newUser = await userRepository.add(newUserData);

  // Check if the user has been added to the database
  if (!newUser) {
    throw new UserCreationError();
  }

  // Add the company user
  const newCompany = await companyRepository.add({
    user: newUser.id,
    name: request.name,
    company: 1, // TODO: CREATE A COMPANY PROFILE BEFORE
  });

  // Check if the company has been added to the database
  if (!newCompany) {
    // Remove the authentication user
    // TODO: Use transactions instead!
    await userRepository.remove(newUser.id);

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

  // TODO: Get the corresponding candidate or company user and include their relevant info in the token

  const tokenProvider = new TokenProvider();
  const token = tokenProvider.sign({ id: user.id, role: undefined }); // TODO: Add roles later...

  const response: LogInResponse = { token: token };
  return response;
};
