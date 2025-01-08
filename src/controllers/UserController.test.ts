import { register, logIn } from "./UserController";
import { LogInRequest, RegisterRequest } from "../requests/UserRequests";
import UserRepository from "../db/repositories/UserRepository";
import bcrypt from "bcrypt";
import { UserCreationError } from "../exceptions/UserExceptions";

jest.mock("../db/repositories/UserRepository");
jest.mock("bcrypt");

const mockUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("UserController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user and return the user id", async () => {
      const request: RegisterRequest = {
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        phone: "1234567890",
        password: "password123",
        birthdate: "1990-01-01",
      };

      const hashedPassword = "hashedPassword123";
      const newUser = {
        id: 1,
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        phone: "1234567890",
        password: "password123",
        birthdate: Date.parse("1990-01-01"),
        created_at: Date.parse("1990-01-01"),
        modified_at: Date.parse("1990-01-01"),
      };

      (mockBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (mockUserRepository.prototype.add as jest.Mock).mockResolvedValue(
        newUser
      );

      const result = await register(request);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(request.password, 10);
      expect(mockUserRepository.prototype.add).toHaveBeenCalledWith({
        email: request.email,
        firstname: request.firstname,
        lastname: request.lastname,
        phone: request.phone,
        password: hashedPassword,
        birthdate: new Date(request.birthdate!),
        created_at: expect.any(Date),
        modified_at: expect.any(Date),
      });
      expect(result).toBe(newUser.id);
    });

    it("should throw UserCreationError if user creation fails", async () => {
      const request: RegisterRequest = {
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        phone: "1234567890",
        password: "password123",
        birthdate: "1990-01-01",
      };

      (mockBcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
      (mockUserRepository.prototype.add as jest.Mock).mockResolvedValue(null);

      await expect(register(request)).rejects.toThrow(UserCreationError);
    });
  });

  describe("logIn", () => {
    it("should return true if the user is authenticated", async () => {
      const request: LogInRequest = {
        email: "test@example.com",
        password: "password123",
      };

      const user = {
        email: "test@example.com",
        password: "hashedPassword123",
      };

      (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
        user
      );
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await logIn(request);

      expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(
        request.email
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        request.password,
        user.password
      );
      expect(result).toBe(true);
    });

    it("should return false if the user is not found", async () => {
      const request: LogInRequest = {
        email: "test@example.com",
        password: "password123",
      };

      (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
        null
      );

      const result = await logIn(request);

      expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(
        request.email
      );
      expect(result).toBe(false);
    });

    it("should return false if the password does not match", async () => {
      const request: LogInRequest = {
        email: "test@example.com",
        password: "password123",
      };

      const user = {
        email: "test@example.com",
        password: "hashedPassword123",
      };

      (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
        user
      );
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await logIn(request);

      expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(
        request.email
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        request.password,
        user.password
      );
      expect(result).toBe(false);
    });
  });
});
