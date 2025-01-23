export interface RegisterCandidateRequest {
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
  password: string;
  birthdate: Date | string;
  address: string;
}

export interface RegisterCompanyRequest {
  email: string;
  name: string;
  password: string;
}

export interface LogInRequest {
  email: string;
  password: string;
}

export interface EditUserRequest {
  id: number;
  email?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  password?: string;
  address?: string;
  birthdate?: Date | string;
}
