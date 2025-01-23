import {
  registerCandidate,
  registerCompany,
  logIn,
} from "./AuthenticationController";
import CandidateRepository from "../db/repositories/CandidateRepository";
import CompanyRepository from "../db/repositories/CompanyRepository";
import {
  LogInRequest,
  RegisterCandidateRequest,
  RegisterCompanyRequest,
} from "../formats/UserRequests";
import UserRepository from "../db/repositories/UserRepository";
import bcrypt from "bcrypt";
import { UserCreationError } from "../exceptions/UserExceptions";

jest.mock("../db/repositories/UserRepository");
jest.mock("bcrypt");

jest.mock("../db/repositories/UserRepository");
jest.mock("../db/repositories/CandidateRepository");
jest.mock("../db/repositories/CompanyRepository");
jest.mock("bcrypt");
jest.mock("../providers/TokenProvider", () => ({
  TokenProvider: jest.fn().mockImplementation(() => ({
    sign: jest.fn().mockReturnValue("mock-token"),
  })),
}));

const mockUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;
const mockCandidateRepository = CandidateRepository as jest.Mocked<
  typeof CandidateRepository
>;
const mockCompanyRepository = CompanyRepository as jest.Mocked<
  typeof CompanyRepository
>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("AuthenticationController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerCandidate", () => {
    it("should register a new candidate and return an authentication token", async () => {
      // Arrange
      const request: RegisterCandidateRequest = {
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        password: "password123",
        birthdate: "1990-01-01",
        address: "123 Main St",
      };
      const hashedPassword = "hashedPassword123";
      const createdUser = {
        id: 1,
        email: request.email,
        password: hashedPassword,
        role: "candidate",
        created_at: new Date(),
        modified_at: new Date(),
      };
      const createdCandidate = {
        id: 1,
        user: createdUser.id,
        firstname: request.firstname,
        lastname: request.lastname,
        birthdate: new Date(request.birthdate),
        address: request.address,
      };

      (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
        null
      );
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (mockUserRepository.prototype.add as jest.Mock).mockResolvedValue(
        createdUser
      );
      (mockCandidateRepository.prototype.add as jest.Mock).mockResolvedValue(
        createdCandidate
      );

      // Act
      const result = await registerCandidate(request);

      // Assert
      expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(
        request.email
      );
      expect(mockBcrypt.hash).toHaveBeenCalledWith(request.password, 10);
      expect(mockUserRepository.prototype.add).toHaveBeenCalledWith({
        email: request.email,
        password: hashedPassword,
        role: "candidate",
        created_at: expect.any(Date),
        modified_at: expect.any(Date),
      });
      expect(mockCandidateRepository.prototype.add).toHaveBeenCalledWith({
        user: createdUser.id,
        firstname: request.firstname,
        lastname: request.lastname,
        birthdate: new Date(request.birthdate),
        address: request.address,
      });
      expect(result).toEqual({ token: "mock-token" });
    });

    it("should throw UserCreationError if the user already exists", async () => {
      // Arrange
      const request: RegisterCandidateRequest = {
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        password: "password123",
        birthdate: "2025-01-01",
        address: "123 Main St",
      };
      (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
        { id: 99 }
      );

      // Act & Assert
      await expect(registerCandidate(request)).rejects.toThrow(
        "Email already in use"
      );
    });

    it("should throw UserCreationError if user creation fails", async () => {
      // Arrange
      const request: RegisterCandidateRequest = {
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        password: "password123",
        birthdate: "2025-01-01",
        address: "123 Main St",
      };
      (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
        null
      );
      (mockBcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
      (mockUserRepository.prototype.add as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(registerCandidate(request)).rejects.toThrow(
        UserCreationError
      );
    });

    it("should remove the user if candidate creation fails", async () => {
      // Arrange
      const request: RegisterCandidateRequest = {
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        password: "password123",
        birthdate: "2025-01-01",
        address: "123 Main St",
      };
      const createdUser = {
        id: 1,
        email: request.email,
        password: "hashedPassword123",
        role: "candidate",
        created_at: new Date(),
        modified_at: new Date(),
      };

      (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
        null
      );
      (mockBcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
      (mockUserRepository.prototype.add as jest.Mock).mockResolvedValue(
        createdUser
      );
      (mockCandidateRepository.prototype.add as jest.Mock).mockResolvedValue(
        null
      );

      // Act & Assert
      await expect(registerCandidate(request)).rejects.toThrow(
        UserCreationError
      );
      expect(mockUserRepository.prototype.remove).toHaveBeenCalledWith(1);
    });
  });

  describe("registerCompany", () => {
    it("should register a new company and return an authentication token", async () => {
      // Arrange
      const request: RegisterCompanyRequest = {
        email: "company@example.com",
        password: "password123",
        name: "My Company",
      };
      const hashedPassword = "hashedPassword123";
      const createdUser = {
        id: 10,
        email: request.email,
        password: hashedPassword,
        role: "company",
        created_at: new Date(),
        modified_at: new Date(),
      };
      const createdCompany = {
        id: 20,
        user: 10,
        name: request.name,
      };

      (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
        null
      );
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (mockUserRepository.prototype.add as jest.Mock).mockResolvedValue(
        createdUser
      );
      (mockCompanyRepository.prototype.add as jest.Mock).mockResolvedValue(
        createdCompany
      );

      // Act
      const result = await registerCompany(request);

      // Assert
      expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(
        request.email
      );
      expect(mockBcrypt.hash).toHaveBeenCalledWith(request.password, 10);
      expect(mockUserRepository.prototype.add).toHaveBeenCalledWith({
        email: request.email,
        password: hashedPassword,
        role: "company",
        created_at: expect.any(Date),
        modified_at: expect.any(Date),
      });
      expect(mockCompanyRepository.prototype.add).toHaveBeenCalledWith({
        user: createdUser.id,
        name: request.name,
      });
      expect(result).toEqual({ token: "mock-token" });
    });

    // Other test cases...
  });

  it("should throw UserCreationError if the user already exists", async () => {
    // Arrange
    const request: RegisterCompanyRequest = {
      email: "company@example.com",
      password: "password123",
      name: "My Company",
    };
    (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue({
      id: 99,
    });

    // Act & Assert
    await expect(registerCompany(request)).rejects.toThrow(
      "Email already in use"
    );
  });

  it("should throw UserCreationError if user creation fails", async () => {
    // Arrange
    const request: RegisterCompanyRequest = {
      email: "company@example.com",
      password: "password123",
      name: "My Company",
    };
    (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
      null
    );
    (mockBcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
    (mockUserRepository.prototype.add as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(registerCompany(request)).rejects.toThrow(UserCreationError);
  });

  it("should remove the user if company creation fails", async () => {
    // Arrange
    const request: RegisterCompanyRequest = {
      email: "company@example.com",
      password: "password123",
      name: "My Company",
    };
    const createdUser = {
      id: 10,
      email: request.email,
      password: "hashedPassword123",
      role: "company",
      created_at: new Date(),
      modified_at: new Date(),
    };

    (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
      null
    );
    (mockBcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
    (mockUserRepository.prototype.add as jest.Mock).mockResolvedValue(
      createdUser
    );
    (mockCompanyRepository.prototype.add as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(registerCompany(request)).rejects.toThrow(UserCreationError);
    expect(mockUserRepository.prototype.remove).toHaveBeenCalledWith(10);
  });

  it("should create a corresponding company profile", async () => {
    // Arrange
    const request: RegisterCompanyRequest = {
      email: "company@example.com",
      password: "password123",
      name: "My Company",
    };
    const hashedPassword = "hashedPassword123";
    const createdUser = {
      id: 10,
      email: request.email,
      password: hashedPassword,
      role: "company",
      created_at: new Date(),
      modified_at: new Date(),
    };
    const createdCompany = {
      id: 20,
      user: 10,
      name: request.name,
    };

    (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
      null
    );
    (mockBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    (mockUserRepository.prototype.add as jest.Mock).mockResolvedValue(
      createdUser
    );
    (mockCompanyRepository.prototype.add as jest.Mock).mockResolvedValue(
      createdCompany
    );

    // Act
    const result = await registerCompany(request);

    // Assert
    expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(
      request.email
    );
    expect(mockBcrypt.hash).toHaveBeenCalledWith(request.password, 10);
    expect(mockUserRepository.prototype.add).toHaveBeenCalledWith({
      email: request.email,
      password: hashedPassword,
      role: "company",
      created_at: expect.any(Date),
      modified_at: expect.any(Date),
    });
    expect(mockCompanyRepository.prototype.add).toHaveBeenCalledWith({
      user: createdUser.id,
      name: request.name,
    });
    expect(result).toEqual({ token: "mock-token" });
  });
});

describe("logIn", () => {
  it("should return the user token if credentials are valid", async () => {
    // Arrange
    const request: LogInRequest = {
      email: "test@example.com",
      password: "password123",
    };
    const user = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword123",
    };

    (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
      user
    );
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Act
    const result = await logIn(request);

    // Assert
    expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(
      request.email
    );
    expect(mockBcrypt.compare).toHaveBeenCalledWith(
      request.password,
      user.password
    );
    expect(result).toEqual({ token: "mock-token" });
  });

  it("should return null if the user is not found", async () => {
    // Arrange
    const request: LogInRequest = {
      email: "test@example.com",
      password: "password123",
    };

    (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
      null
    );

    // Act
    const result = await logIn(request);

    // Assert
    expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(
      request.email
    );
    expect(result).toBe(null);
  });

  it("should return null if the password does not match", async () => {
    // Arrange
    const request: LogInRequest = {
      email: "test@example.com",
      password: "password123",
    };
    const user = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword123",
    };

    (mockUserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(
      user
    );
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act
    const result = await logIn(request);

    // Assert
    expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(
      request.email
    );
    expect(mockBcrypt.compare).toHaveBeenCalledWith(
      request.password,
      user.password
    );
    expect(result).toBe(null);
  });
});
// });
