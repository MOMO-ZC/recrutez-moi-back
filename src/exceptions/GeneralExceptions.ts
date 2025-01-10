export class DatabaseError extends Error {
  constructor(message?: string) {
    super(message || "An error occurred with the database.");
    this.name = "DatabaseError";
  }
}

export class DatabaseInsertionError extends DatabaseError {
  constructor(message?: string) {
    super(message || "Could not insert into the database.");
    this.name = "DatabaseInsertionError";
  }
}