import OfferRepository from "../db/repositories/OfferRepository";
import { OfferNotFoundError } from "../exceptions/OfferExceptions";
import {
  AddOfferRequest,
  GetAllOffersRequest,
  GetOfferByIdRequest,
  RemoveOfferRequest,
  UpdateOfferRequest,
} from "../formats/OfferRequests";
import {
  AddOfferResponse,
  GetOfferByIdResponse,
  RemoveOfferResponse,
  UpdateOfferResponse,
} from "../formats/OfferResponses";

const offerRepository = new OfferRepository();

export const AddOffer = async (
  request: AddOfferRequest
): Promise<AddOfferResponse> => {
  // Separate the offer from the other tables
  const requestOffer = {
    id_company: request.id_company,
    title: request.title,
    body: request.body,
    minSalary: request.minSalary,
    maxSalary: request.maxSalary,
    address: request.address,
    status: request.status ?? "pending",
    image: request.image,
  };

  const requestSkills = request.skills;
  const requestEducation = request.education;
  const requestExperiences = request.experiences;
  const requestLanguages = request.languages;

  const offer = await offerRepository.create(requestOffer);

  // Add skills
  offerRepository.addSkills(offer.id, requestSkills);

  // Add education
  offerRepository.addEducation(offer.id, requestEducation);

  // Add experiences
  offerRepository.addExperiences(offer.id, requestExperiences);

  // Add languages
  offerRepository.addLanguages(offer.id, requestLanguages);

  return offer;
};

export const UpdateOffer = async (
  request: UpdateOfferRequest
): Promise<UpdateOfferResponse> => {
  return await offerRepository.updateWithLinks(request);
};

export const RemoveOffer = async (
  request: RemoveOfferRequest
): Promise<RemoveOfferResponse> => {
  await offerRepository.delete(request.id);
  return {};
};

export const GetOfferById = async (
  request: GetOfferByIdRequest
): Promise<GetOfferByIdResponse> => {
  const offer = await offerRepository.getById(request.id);
  if (!offer || !offer.id) {
    throw new OfferNotFoundError();
  }

  return offer;
};

export const GetAllOffers = async (
  request: GetAllOffersRequest
): Promise<GetOfferByIdResponse[]> => {
  return await offerRepository.getAll();
};
