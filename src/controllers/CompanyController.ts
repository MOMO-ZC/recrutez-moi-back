import CompanyRepository from "../db/repositories/CompanyRepository";
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
    throw new UserNotFoundError();
  }

  return {
    id: company.user,
    company_id: company.company,
    name: company.name,
  };
};

export const UpdateCompany = async (
  request: UpdateCompanyRequest
): Promise<null> => {
  let { id, ...updateData } = request;

  // Check if the user exists
  const company = await companyRepository.findById(id);
  if (!company) {
    throw new UserNotFoundError();
  }

  // Check if the password is being updated
  if (updateData.password) {
    updateData.password = await passwordProvider.hash(updateData.password);
  }

  // Update the candidate and its associated user
  await companyRepository.updateWithUser({
    id: id,
    fullUser: updateData,
  });

  return null;
};
