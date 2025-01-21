import OfferRepository from "../db/repositories/OfferRepository";
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
  return await offerRepository.create(request);
};

export const UpdateOffer = async (
  request: UpdateOfferRequest
): Promise<UpdateOfferResponse> => {
  return await offerRepository.update(request);
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
  return await offerRepository.getById(request.id);
};

export const GetAllOffers = async (
  request: GetAllOffersRequest
): Promise<GetOfferByIdResponse[]> => {
  return await offerRepository.getAll();
};
