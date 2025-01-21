import { InferSelectModel } from "drizzle-orm";
import { jobOffersTable } from "../db/schema";

export interface AddOfferResponse
  extends InferSelectModel<typeof jobOffersTable> {}

export interface UpdateOfferResponse
  extends InferSelectModel<typeof jobOffersTable> {}

export interface RemoveOfferResponse {}

export interface GetOfferByIdResponse
  extends InferSelectModel<typeof jobOffersTable> {}

export interface GetOffersResponse
  extends Array<InferSelectModel<typeof jobOffersTable>> {}
