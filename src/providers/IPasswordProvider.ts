/**
 * Interface for password hashing and comparison operations.
 * @interface
 */
export default interface IPasswordProvider {
  /**
   * Hashes a password.
   * @param password The password to hash.
   */
  hash(password: string): Promise<string>;

  /**
   * Compares a password with a hash.
   * @param password The password to compare.
   * @param hash The hash to compare.
   */
  compare(password: string, hash: string): Promise<boolean>;
}
