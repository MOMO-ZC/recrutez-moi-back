export class UserCreationError extends Error {
  constructor(message?: string) {
    super(message || "User creation failed");
    this.name = "UserCreationError";
  }
}
