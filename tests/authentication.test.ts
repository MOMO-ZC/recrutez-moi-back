import { register, logIn } from "../src/controllers/UserController";
import { db } from "../src/db";
import bcrypt from "bcrypt";
import { RegisterRequest, LogInRequest } from "../src/requests/UserRequests";

jest.mock("../src/db", () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
  },
}));

jest.mock("bcrypt");

describe("UserController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should create a user and return the new user ID", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 123 }]),
      });

      const request: RegisterRequest = {
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        password: "password123",
      };
      const userId = await register(request);

      expect(userId).toBe(123);
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    });

    it("should throw an error if insertion fails", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue("DB Error"),
      });

      const request: RegisterRequest = {
        email: "failed@example.com",
        firstname: "Fail",
        lastname: "Case",
        password: "password123",
      };

      await expect(register(request)).rejects.toThrow("DB Error");
    });
  });

  describe("logIn", () => {
    it("should return true if bcrypt.compare returns true", async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ hashedPassword: "hashedValue" }]),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const request: LogInRequest = {
        email: "test@example.com",
        password: "password123",
      };
      const result = await logIn(request);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedValue");
    });

    it("should return false if no user is found", async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      });

      const request: LogInRequest = {
        email: "nonexistent@example.com",
        password: "whatever",
      };
      const result = await logIn(request);

      expect(result).toBe(false);
    });

    it("should throw an error if retrieval fails", async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockRejectedValue("DB Error"),
      });

      const request: LogInRequest = {
        email: "error@example.com",
        password: "error",
      };
      await expect(logIn(request)).rejects.toThrow("DB Error");
    });
  });
});
