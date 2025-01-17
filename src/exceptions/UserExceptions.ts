export class UserCreationError extends Error {
  constructor(message?: string) {
    super(message || "User creation failed");
    this.name = "UserCreationError";
  }
}

export class UserNotFoundError extends Error {
  constructor(message?: string) {
    super(message || "User not found");
    this.name = "UserNotFoundError";
  }
}

export class UserAlreadyExists extends Error {
  constructor(message?: string) {
    super(message || "User already exists");
    this.name = "UserAlreadyExists";
  }
}
