export interface RegisterRequest {
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
  password: string;
  birthdate?: Date | string;
}

export interface LogInRequest {
  email: string;
  password: string;
}
