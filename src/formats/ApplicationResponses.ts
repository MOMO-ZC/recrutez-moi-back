export interface AboutApplicationResponse {
  id: number;
  status: "pending" | "rejected" | "offered";
  job_offer: {
    id: number;
    title: string;
    company: string;
  };
}

export interface GetUserApplicationsResponse {
  applications: AboutApplicationResponse[];
}

export interface AcceptApplicationResponse {}

export interface RejectApplicationResponse {}
