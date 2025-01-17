/**
 * Represents a token provider.
 */
export interface ITokenProvider {
  /**
   * Sign and return a token with the given payload.
   * @param payload The payload to include in the token.
   */
  sign(payload: any): string;

  /**
   * Verifies whether a given token is valid.
   * @param token The token to verify.
   */
  verify(token: string): boolean;

  /**
   * Decodes the given token WITHOUT verifying its signature.
   * @param token The token to decode.
   */
  decode(token: string): any; // TODO: Return claims instead

  /**
   * Verifies and decodes the given token.
   * @param token The token to verify and decode.
   */
  verifyAndDecode(token: string): any; // TODO: Return claims instead
}
