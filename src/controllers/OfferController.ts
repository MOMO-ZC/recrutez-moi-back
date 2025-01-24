import OfferRepository from "../db/repositories/OfferRepository";
import UserRepository from "../db/repositories/UserRepository";
import { OfferNotFoundError } from "../exceptions/OfferExceptions";
import { UserNotFoundError } from "../exceptions/UserExceptions";
import {
  AddOfferRequest,
  GetAllOffersRequest,
  GetLikedOffersRequest,
  GetOfferByIdRequest,
  LikeOfferRequest,
  RemoveOfferRequest,
  UpdateOfferRequest,
} from "../formats/OfferRequests";
import {
  AddOfferResponse,
  GetLikedOffersResponse,
  GetOfferByIdResponse,
  GetOffersResponse,
  LikeOfferResponse,
  RemoveOfferResponse,
  UpdateOfferResponse,
} from "../formats/OfferResponses";

const offerRepository = new OfferRepository();

export const AddOffer = async (
  request: AddOfferRequest
): Promise<AddOfferResponse> => {
  // Separate the offer from the other tables
  const requestOffer = {
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

  const offer = await offerRepository.create(request.userId, requestOffer);

  // Add skills
  if (requestSkills) offerRepository.addSkills(offer.id, requestSkills);

  // Add education
  if (requestEducation)
    offerRepository.addEducation(offer.id, requestEducation);

  // Add experiences
  if (requestExperiences)
    offerRepository.addExperiences(offer.id, requestExperiences);

  // Add languages
  if (requestLanguages)
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
  let offer = { ...(await offerRepository.getById(request.id)), liked: false };
  if (!offer || !offer.id) {
    throw new OfferNotFoundError();
  }

  const likes = await offerRepository.doesUserLike(request.id, request.id_user);
  if (likes) offer.liked = true;

  return offer;
};

export const GetAllOffers = async (
  request: GetAllOffersRequest
): Promise<GetOffersResponse> => {
  return await offerRepository.getAllWithLiked(request.id_user);
};

export const GetLikedOffers = async (
  request: GetLikedOffersRequest
): Promise<GetLikedOffersResponse> => {
  const likedOffers = await offerRepository.getLiked(request.id_user);
  return likedOffers;
};

export const LikeOffer = async (
  request: LikeOfferRequest
): Promise<LikeOfferResponse> => {
  // Check if the offer exists
  const offer = await offerRepository.getById(request.id_offer);
  if (!offer.id) {
    throw new OfferNotFoundError();
  }

  // Check if the user exists
  const user = await new UserRepository().findById(request.id_user);
  if (!user) {
    throw new UserNotFoundError();
  }

  const userAlreadyLikes = await offerRepository.doesUserLike(
    request.id_offer,
    request.id_user
  );

  if (userAlreadyLikes === false) {
    await offerRepository.like(request.id_offer, request.id_user);
  }
  return {};
};

export const UnlikeOffer = async (
  request: LikeOfferRequest
): Promise<LikeOfferResponse> => {
  await offerRepository.unlike(request.id_offer, request.id_user);
  return {};
};
