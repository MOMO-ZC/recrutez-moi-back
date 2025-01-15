import IPasswordProvider from "./IPasswordProvider";
import * as bcrypt from "bcrypt";

/**
 * Class that implements the IPasswordProvider interface.
 */
export default class PasswordProvider implements IPasswordProvider {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
