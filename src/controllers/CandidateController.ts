import { sql } from "drizzle-orm";
import CandidateRepository from "../db/repositories/CandidateRepository";
import { UserNotFoundError } from "../exceptions/UserExceptions";
import {
  AboutCandidateRequest,
  UpdateCandidateRequest,
} from "../formats/CandidateRequests";
import { AboutCandidateResponse } from "../formats/CandidateResponses";
import GeocodingProvider from "../providers/GeocodingProvider";
import PasswordProvider from "../providers/PasswordProvider";

const passwordProvider = new PasswordProvider();
const candidateRepository = new CandidateRepository();

export const AboutCandidate = async (
  request: AboutCandidateRequest
): Promise<AboutCandidateResponse> => {
  const candidate = await candidateRepository.findById(request.id);

  if (!candidate) {
    throw new UserNotFoundError();
  }

  return {
    id: candidate.user,
    firstname: candidate.firstname,
    lastname: candidate.lastname,
    phone: candidate.phone || undefined,
    address: candidate.address || undefined,
    birthdate: candidate.birthdate.toISOString(),
    lookingForTitle: candidate.lookingForTitle || undefined,
    lookingForExperience: candidate.lookingForExperience || undefined,
  };
};

export const UpdateCandidate = async (
  request: UpdateCandidateRequest
): Promise<null> => {
  let { id, ...updateData } = request;

  // Check if the user exists
  const candidate = await candidateRepository.findById(id);
  if (!candidate) {
    throw new UserNotFoundError();
  }

  // Check if the password is being updated
  if (updateData.password) {
    updateData.password = await passwordProvider.hash(updateData.password);
  }

  // Check if the address is being updated
  if (updateData.address) {
    // Call Geocoding API to get the GPS location
    const geocodingProvider = new GeocodingProvider();
    const gpsLocationResponse = await geocodingProvider.geocode(
      updateData.address
    );
    updateData.gps_location = [
      gpsLocationResponse.lon,
      gpsLocationResponse.lat,
    ];
  }

  // Update the candidate and its associated user
  await candidateRepository.updateWithUser({
    id: id,
    fullUser: updateData,
  });

  return null;
};
