import { InferSelectModel } from "drizzle-orm";
import { jobOffersTable } from "../db/schema";

export interface AddOfferResponse
  extends InferSelectModel<typeof jobOffersTable> {}

export interface UpdateOfferResponse
  extends InferSelectModel<typeof jobOffersTable> {}

export interface RemoveOfferResponse {}

export interface GetOfferByIdResponse
  extends InferSelectModel<typeof jobOffersTable> {
  company_name: string;
  liked: boolean;
  skills: { id: number; name: string; type: string; category: string }[];
  education: { id: number; domain: string; diploma: string }[];
  experiences: { id: number; name: string }[];
  languages: { id: number; name: string; level: string }[];
}

export interface GetCompanyOffersResponse {
  offers: {
    id: number;
    id_company: number;
    company_name: string;
    title: string;
    body: string;
    min_salary: number;
    max_salary: number;
    location_type: string;
    address: string;
    gps_location: number[];
    status: string;
    image: string;
    created_at: Date;
    modified_at: Date;
    number_applicants: number;
    skills: { id: number; name: string; type: string; category: string }[];
    education: { id: number; domain: string; diploma: string }[];
    experiences: { id: number; name: string }[];
    languages: { id: number; name: string; level: string }[];
  }[];
}

export interface GetOffersResponse
  extends Array<
    InferSelectModel<typeof jobOffersTable> & {
      company_name: string;
      liked: boolean;
      skills: { id: number; name: string; type: string; category: string }[];
      education: { id: number; domain: string; diploma: string }[];
      experiences: { id: number; name: string }[];
      languages: { id: number; name: string; level: string }[];
    }
  > {}

export interface GetLikedOffersResponse
  extends Array<
    InferSelectModel<typeof jobOffersTable> & { company_name: string }
  > {}

export interface LikeOfferResponse {
  liked_offers_number: number;
}

export interface UnlikeOfferResponse {
  liked_offers_number: number;
}

export interface ApplyOfferResponse {
  id: number;
}

export interface GetApplicationsOfferResponse {
  applications: {
    id: number;
    offerId: number;
    userId: number;
    userFullname: string;
    status: string;
    appliedAt: Date;
  }[];
}
