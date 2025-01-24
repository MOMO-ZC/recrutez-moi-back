export interface AddOfferRequest {
  userId: number; // Set by the authentication middleware
  title: string;
  body: string;
  minSalary: number;
  maxSalary: number;
  locationType?: "onsite" | "hybrid" | "remote";
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
  salary: number | undefined;
  locationType?: "onsite" | "hybrid" | "remote";
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
