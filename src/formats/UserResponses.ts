export interface RegisterResponse {
  id_user: number;
  id_candidate?: number; // Depending on the role of the new user, always the same as id_user
  id_company?: number; // Depending on the role of the new user, can be different from id_user
  role: string;
  token: string;
}

export interface LogInResponse {
  id_user: number;
  id_candidate?: number; // Depending on the role of the new user, always the same as id_user
  id_company?: number; // Depending on the role of the new user, can be different from id_user
  role: string;
  token: string;
}
