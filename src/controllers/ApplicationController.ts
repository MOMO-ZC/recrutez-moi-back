import ApplicationRepository from "../db/repositories/ApplicationRepository";
import CompanyRepository from "../db/repositories/CompanyRepository";
import OfferRepository from "../db/repositories/OfferRepository";
import UserRepository from "../db/repositories/UserRepository";
import {
  AboutApplicationRequest,
  AcceptApplicationRequest,
  GetUserApplicationsRequest,
  RejectApplicationRequest,
} from "../formats/ApplicationRequests";
import {
  AboutApplicationResponse,
  AcceptApplicationResponse,
  GetUserApplicationsResponse,
  RejectApplicationResponse,
} from "../formats/ApplicationResponses";

const applicationRepository = new ApplicationRepository();

export const AboutApplication = async (
  request: AboutApplicationRequest
): Promise<AboutApplicationResponse> => {
  const application = await applicationRepository.getApplicationById(
    request.id
  );
  const offer = await new OfferRepository().getById(application.id_job_offer);
  const company = await new CompanyRepository().findById(offer.id_company);

  if (company === null) {
    throw new Error("Company not found");
  }
  const companyUser = await new CompanyRepository().findUser(company.id);

  // Check authorizations
  const user = await new UserRepository().findById(request.id_user);
  if (user === null) {
    throw new Error("User not found");
  }

  if (user.role === "candidate" && user.id !== application.id_user) {
    throw new Error("User not authorized to see this application");
  }

  if (user.role === "company" && companyUser.id !== user.id) {
    throw new Error("User not authorized to see this application");
  }

  return {
    id: application.id,
    status: application.status,
    job_offer: {
      id: offer.id,
      title: offer.title,
      company: company.name,
    },
  };
};

export const GetUserApplications = async (
  request: GetUserApplicationsRequest
): Promise<GetUserApplicationsResponse> => {
  const applications = await applicationRepository.getApplicationsForUser(
    request.userId
  );

  const applicationDetails = await Promise.all(
    applications.map(async (application) => {
      const offer = await new OfferRepository().getById(
        application.id_job_offer
      );
      const company = await new CompanyRepository().findById(offer.id_company);

      if (company === null) {
        throw new Error("Company not found");
      }

      return {
        id: application.id,
        status: application.status,
        job_offer: {
          id: application.id_job_offer,
          title: offer.title,
          company: company.name,
        },
      };
    })
  );

  return {
    applications: applicationDetails,
  };
};

export const AcceptApplication = async (
  request: AcceptApplicationRequest
): Promise<AcceptApplicationResponse> => {
  // Check authorizations
  const application = await applicationRepository.getApplicationById(
    request.id
  );
  const offer = await new OfferRepository().getById(application.id_job_offer);
  const company = await new CompanyRepository().findById(offer.id_company);

  if (company === null) {
    throw new Error("Company not found");
  }

  const companyUser = await new CompanyRepository().findUser(company.id);

  if (companyUser.id !== request.userId) {
    throw new Error("User not authorized to accept this application");
  }

  await applicationRepository.acceptApplication(request.id);

  if (request.rejectPendingApplications === true) {
    // Get the offer of the application
    const application = await applicationRepository.getApplicationById(
      request.id
    );

    // Reject other applications
    await applicationRepository.rejectAllPendingApplications(
      application.id_job_offer
    );
  }
  return {};
};

export const RejectApplication = async (
  request: RejectApplicationRequest
): Promise<RejectApplicationResponse> => {
  // Check authorizations
  const application = await applicationRepository.getApplicationById(
    request.id
  );
  const offer = await new OfferRepository().getById(application.id_job_offer);
  const company = await new CompanyRepository().findById(offer.id_company);

  if (company === null) {
    throw new Error("Company not found");
  }

  const companyUser = await new CompanyRepository().findUser(company.id);

  if (companyUser.id !== request.userId) {
    throw new Error("User not authorized to reject this application");
  }

  await applicationRepository.rejectApplication(request.id);
  return {};
};
