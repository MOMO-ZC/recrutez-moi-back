import { ITokenProvider } from "./ITokenProvider";
import jwt, { Algorithm, Secret, SignOptions } from "jsonwebtoken";

/**
 * Provides JWT token management.
 */
export class TokenProvider implements ITokenProvider {
  private readonly algorithm: Algorithm;
  private readonly expiresIn: number;
  private readonly secret: Secret;

  constructor() {
    this.algorithm = (process.env.JWT_ALGORITHM as Algorithm) || "HS512";
    this.expiresIn = process.env.JWT_EXPIRES_IN
      ? parseInt(process.env.JWT_EXPIRES_IN)
      : 86400;
    this.secret = process.env.JWT_SECRET || "defaultSecretKey";
  }

  sign(payload: any): string {
    const options: SignOptions = {
      algorithm: this.algorithm,
      expiresIn: this.expiresIn,
      issuer: "recrutez-moi-backend",
    };
    return jwt.sign(payload, this.secret, options);
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
