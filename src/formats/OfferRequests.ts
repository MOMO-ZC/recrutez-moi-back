export interface AddOfferRequest {
  id_company: number;
  title: string;
  body: string;
  salary: number;
  address: string;
  status: string;
  // TODO: Add skills, education, experiences and languages.
}

export interface UpdateOfferRequest {
  id: number;
  title: string | undefined;
  body: string | undefined;
  salary: number | undefined;
  address: string | undefined;
  status: string | undefined;
}

export interface RemoveOfferRequest {
  id: number;
}

export interface GetOfferByIdRequest {
  id: number;
}

export interface GetAllOffersRequest {}
