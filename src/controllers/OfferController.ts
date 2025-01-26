import OfferRepository from "../db/repositories/OfferRepository";
import UserRepository from "../db/repositories/UserRepository";
import { OfferNotFoundError } from "../exceptions/OfferExceptions";
import { UserNotFoundError } from "../exceptions/UserExceptions";
import {
  AddOfferRequest,
  ApplyOfferRequest,
  GetAllOffersRequest,
  GetLikedOffersRequest,
  GetOfferByIdRequest,
  LikeOfferRequest,
  RemoveOfferRequest,
  UpdateOfferRequest,
} from "../formats/OfferRequests";
import {
  AddOfferResponse,
  ApplyOfferResponse,
  GetApplicationsOfferResponse,
  GetLikedOffersResponse,
  GetOfferByIdResponse,
  GetOffersResponse,
  LikeOfferResponse,
  RemoveOfferResponse,
  UpdateOfferResponse,
} from "../formats/OfferResponses";
import GeocodingProvider from "../providers/GeocodingProvider";

const offerRepository = new OfferRepository();

export const AddOffer = async (
  request: AddOfferRequest
): Promise<AddOfferResponse> => {
  // Check if there is an address
  let gpsLocation: [number, number] | null = null;
  if (request.address) {
    // Get the gps coordinates from the address
    const geocodingProvider = new GeocodingProvider();
    const gpsLocationResponse = await geocodingProvider.geocode(
      request.address
    );
    gpsLocation = [gpsLocationResponse.lon, gpsLocationResponse.lat];
  }

  // Separate the offer from the other tables
  const requestOffer = {
    title: request.title,
    body: request.body,
    min_salary: request.min_salary,
    max_salary: request.max_salary,
    // TODO: Check that if locationType is onsite or hybrid, address is not null
    location_type:
      request.location_type || (request.address ? "onsite" : "remote"),
    address: request.address,
    gps_location: gpsLocation,
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
  let requestData: UpdateOfferRequest & { gps_location?: [number, number] } = {
    ...request,
  };
  console.log(requestData);
  console.log(requestData.address);
  console.log(requestData.address ? "yes" : "no");
  if (requestData.address) {
    // Get the gps coordinates from the address
    const geocodingProvider = new GeocodingProvider();
    const gpsLocationResponse = await geocodingProvider.geocode(
      requestData.address
    );
    console.log("OK", gpsLocationResponse);
    requestData.gps_location = [
      gpsLocationResponse.lon,
      gpsLocationResponse.lat,
    ];
  }

  return await offerRepository.updateWithLinks(requestData);
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

export const ApplyOffer = async (
  request: ApplyOfferRequest
): Promise<ApplyOfferResponse> => {
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

  // Check if the user already applied
  const alreadyApplied = await offerRepository.hasUserApplied(
    request.id_offer,
    request.id_user
  );
  if (alreadyApplied) {
    throw new Error("User already applied to this offer");
  }

  const application = await offerRepository.apply(
    request.id_offer,
    request.id_user
  );
  return application;
};

export const GetApplications = async (
  offerId: number
): Promise<GetApplicationsOfferResponse> => {
  const applications = await offerRepository.getApplications(offerId);
  const formattedApplications = applications.map((application) => ({
    id: application.id,
    offerId: offerId,
    userId: application.id_user,
    userFullname: application.userFullname,
    status: application.status,
    appliedAt: new Date(application.created_at),
  }));
  return { applications: formattedApplications };
};
