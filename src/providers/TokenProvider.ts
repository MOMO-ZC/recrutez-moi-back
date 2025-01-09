import { ITokenProvider } from "./ITokenProvider";
import jwt, { Algorithm } from "jsonwebtoken";

/**
 * Provides JWT token management.
 */
export class TokenProvider implements ITokenProvider {
  private readonly algorithm: Algorithm;
  private readonly expiresIn: string;
  private readonly secret: string;

  constructor() {
    this.algorithm = (process.env.JWT_ALGORITHM as Algorithm) || "HS512";
    this.expiresIn = process.env.JWT_EXPIRES_IN || "1d";
    this.secret = process.env.JWT_SECRET!;
  }

  sign(payload: any): string {
    return jwt.sign(payload, this.secret, {
      algorithm: this.algorithm,
      expiresIn: this.expiresIn,
      issuer: "recrutez-moi-backend",
    });
  }

  verify(token: string): boolean {
    try {
      jwt.verify(token, this.secret);
    } catch {
      return false;
    }
    return true;
  }

  decode(token: string): any {
    return jwt.decode(token);
  }

  verifyAndDecode(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch {
      return null;
    }
  }
}
