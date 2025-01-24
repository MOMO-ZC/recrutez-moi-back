import { InferSelectModel } from "drizzle-orm";
import { jobOffersTable } from "../db/schema";

export interface AddOfferResponse
  extends InferSelectModel<typeof jobOffersTable> {}

export interface UpdateOfferResponse
  extends InferSelectModel<typeof jobOffersTable> {}

export interface RemoveOfferResponse {}

export interface GetOfferByIdResponse
  extends InferSelectModel<typeof jobOffersTable> {
  liked: boolean;
  skills: { id: number; name: string; type: string; category: string }[];
  education: { id: number; domain: string; diploma: string }[];
  experiences: { id: number; name: string }[];
  languages: { id: number; name: string; level: string }[];
}

export interface GetOffersResponse
  extends Array<
    InferSelectModel<typeof jobOffersTable> & {
      liked: boolean;
      skills: { id: number; name: string; type: string; category: string }[];
      education: { id: number; domain: string; diploma: string }[];
      experiences: { id: number; name: string }[];
      languages: { id: number; name: string; level: string }[];
    }
  > {}

export interface GetLikedOffersResponse
  extends Array<InferSelectModel<typeof jobOffersTable>> {}

export interface LikeOfferResponse {}

export interface UnlikeOfferResponse {}
