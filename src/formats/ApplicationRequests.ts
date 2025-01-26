export interface AboutApplicationRequest {
  id: number; // Set in the URL
  id_user: number; // Set by the authentication middleware
}

export interface GetUserApplicationsRequest {
  userId: number; // Set by the authentication middleware
}

export interface AcceptApplicationRequest {
  id: number; // Set in the URL
  userId: number; // Set by the authentication middleware
  rejectPendingApplications?: boolean; // default: false
}

export interface RejectApplicationRequest {
  id: number; // Set in the URL
  userId: number; // Set by the authentication middleware
}
