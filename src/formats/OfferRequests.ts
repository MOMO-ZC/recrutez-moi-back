export interface AddOfferRequest {
  id_company: number;
  title: string;
  body: string;
  minSalary: number;
  maxSalary: number;
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
}

export interface GetAllOffersRequest {}
