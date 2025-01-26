export interface AddOfferRequest {
  userId: number; // Set by the authentication middleware
  title: string;
  body: string;
  min_salary: number;
  max_salary: number;
  location_type?: "onsite" | "hybrid" | "remote";
  address: string;
  status?: string;
  image: string;
  skills: number[];
  education: number[];
  experiences: number[];
  languages: { id: number; level: string }[];
}

export interface UpdateOfferRequest {
  id: number;
  title: string | undefined;
  body: string | undefined;
  min_salary: number | undefined;
  max_salary: number | undefined;
  location_type?: "onsite" | "hybrid" | "remote";
  address: string | undefined;
  status: string | undefined;
  skills: number[] | undefined;
  education: number[] | undefined;
  experiences: number[] | undefined;
  languages: { id: number; level: string }[] | undefined;
}

export interface RemoveOfferRequest {
  id: number;
}

export interface GetOfferByIdRequest {
  id: number;
  id_user: number; // Set by the authentication middleware
}

export interface GetAllOffersRequest {
  id_user: number; // Set by the authentication middleware
}

export interface GetLikedOffersRequest {
  id_user: number; // Set by the authentication middleware
}

export interface LikeOfferRequest {
  id_user: number; // Set by the authentication middleware
  id_offer: number;
}

export interface UnlikeOfferRequest {
  id_user: number; // Set by the authentication middleware
  id_offer: number;
}

export interface ApplyOfferRequest {
  id_user: number; // Set by the authentication middleware
  id_offer: number; // Set in the URL
}

export interface GetApplicationsOfferRequest {
  id_user: number; // Set by the authentication middleware
  id_offer: number; // Set in the URL
}
