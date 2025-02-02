import CompanyRepository from "../db/repositories/CompanyRepository";
import { UnauthorizedAccessError } from "../exceptions/GeneralExceptions";
import { UserNotFoundError } from "../exceptions/UserExceptions";
import {
  AboutCompanyRequest,
  UpdateCompanyRequest,
} from "../formats/CompanyRequests";
import { AboutCompanyResponse } from "../formats/CompanyResponses";
import PasswordProvider from "../providers/PasswordProvider";

const passwordProvider = new PasswordProvider();
const companyRepository = new CompanyRepository();

export const AboutCompany = async (
  request: AboutCompanyRequest
): Promise<AboutCompanyResponse> => {
  const company = await companyRepository.findById(request.id);

  if (!company) {
    // FIXME: Change to a custom error implementation
    throw new Error("Company not found");
  }

  const user = await companyRepository.findUser(company.id);
  if (!user) {
    throw new UserNotFoundError();
  }

  return {
    id: company.id,
    email: user.email,
    name: company.name,
    created_at: new Date(company.created_at),
    modified_at: new Date(company.modified_at),
  };
};

export const UpdateCompany = async (
  request: UpdateCompanyRequest
): Promise<null> => {
  const id = request.id;
  const updateData = {
    name: request.name,
    email: request.email,
    password: request.password,
  };

  // Check that the user is updating themselves
  if (request.companyLoginId !== id) {
    throw new UnauthorizedAccessError();
  }

  // Check if the user exists
  const company = await companyRepository.findById(id);
  if (!company) {
    throw new Error("Company not found");
  }

  // Check if the password is being updated
  if (updateData.password) {
    updateData.password = await passwordProvider.hash(updateData.password);
  }
  // Update the candidate and its associated user
  await companyRepository.updateWithUser({
    id_company: id,
    id_user: request.userId,
    fullUser: updateData,
  });

  return null;
};
