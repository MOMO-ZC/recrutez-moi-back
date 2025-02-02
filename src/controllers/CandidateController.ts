import CandidateRepository from "../db/repositories/CandidateRepository";
import { UserNotFoundError } from "../exceptions/UserExceptions";
import {
  AboutCandidateRequest,
  AddCandidateExistingEducationRequest,
  AddCandidateNewEducationRequest,
  DeleteCandidateEducationRequest,
  GetCandidateEducationsRequest,
  UpdateCandidateRequest,
} from "../formats/CandidateRequests";
import {
  AboutCandidateResponse,
  GetCandidateEducationResponse,
  GetCandidateEducationsResponse,
} from "../formats/CandidateResponses";
import GeocodingProvider from "../providers/GeocodingProvider";
import PasswordProvider from "../providers/PasswordProvider";
import { UnauthorizedAccessError } from "../exceptions/GeneralExceptions";
import EducationRepository from "../db/repositories/EducationRepository";

const passwordProvider = new PasswordProvider();
const candidateRepository = new CandidateRepository();

export const AboutCandidate = async (
  request: AboutCandidateRequest
): Promise<AboutCandidateResponse> => {
  // Check that the user is checking about themselves (candidate) or about a candidate who applied to their offer (company)
  if (request.userRole === "candidate") {
    // Check that the is the same as the one in the token
    if (request.id !== request.userId) {
      throw new UnauthorizedAccessError();
    }
  } else {
    // Check that the user has applied to an offer from the company
    // TODO: Do that.
  }
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
  let { id, userId, ...updateData } = request;

  // Check that the user is updating themselves
  if (userId !== id) {
    throw new UnauthorizedAccessError();
  }

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

export const AddCandidateEducation = async (
  request:
    | AddCandidateExistingEducationRequest
    | AddCandidateNewEducationRequest
): Promise<GetCandidateEducationResponse> => {
  // Check if the user exists
  const candidate = await candidateRepository.findById(request.id_candidate);
  if (!candidate) {
    throw new UserNotFoundError();
  }

  if ("id_education" in request) {
    // Add an existing education

    // Check that the user doesn't already have the education
    if (
      await candidateRepository.educationExists(
        request.id_candidate,
        request.id_education
      )
    ) {
      throw new Error("Education already exists for this candidate");
    }
    const result = await candidateRepository.addEducation(
      request.id_candidate,
      request.id_education,
      request.school,
      request.start,
      request.end
    );
    return {
      education: result.education,
      school: result.school,
      start: result.start,
      end: result.end,
      created_at: result.created_at,
      modified_at: result.modified_at,
    };
  } else {
    // Create a new education
    const education = await new EducationRepository().create(
      request.domain,
      request.diploma
    );

    // Add the education to the candidate
    const result = await candidateRepository.addEducation(
      request.id_candidate,
      education.id,
      request.school,
      request.start,
      request.end
    );

    return {
      education: result.education,
      school: result.school,
      start: result.start,
      end: result.end,
      created_at: result.created_at,
      modified_at: result.modified_at,
    };
  }
};

export const GetCandidateEducations = async (
  request: GetCandidateEducationsRequest
): Promise<GetCandidateEducationsResponse> => {
  const educations = await candidateRepository.getCandidateEducations(
    request.id_candidate
  );

  return {
    candidate_educations: educations.candidate_educations.map((education) => ({
      education: education.education,
      school: education.school,
      start: education.start,
      end: education.end,
      created_at: education.created_at,
      modified_at: education.modified_at,
    })),
  };
};

export const DeleteCandidateEducation = async (
  request: DeleteCandidateEducationRequest
): Promise<void> => {
  await candidateRepository.DeleteEducation(
    request.id_candidate,
    request.id_education
  );
};

export const GetCandidateSkills = async (
  id_candidate: number
): Promise<{
  skills: { id: number; name: string; type: string; category: string }[];
}> => {
  return await candidateRepository.getCandidateSkills(id_candidate);
};
