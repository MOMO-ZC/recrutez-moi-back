import "dotenv/config";
import { EditUserRequest } from "../formats/UserRequests";
import UserRepository from "../db/repositories/UserRepository";
import PasswordProvider from "../providers/PasswordProvider";

const userRepository = new UserRepository();
const passwordProvider = new PasswordProvider();

export const editUser = async (request: EditUserRequest): Promise<null> => {
  let { id, ...updateData } = request;

  // Check if password is being updated
  if (request.password) {
    request.password = await passwordProvider.hash(request.password);
  }

  // Update the user
  try {
    await userRepository.update(id, {
      ...updateData,
      birthdate: updateData.birthdate
        ? updateData.birthdate instanceof Date
          ? updateData.birthdate
          : new Date(updateData.birthdate)
        : undefined,
      modified_at: new Date(),
    });
  } catch (error) {}

  return null;
};
