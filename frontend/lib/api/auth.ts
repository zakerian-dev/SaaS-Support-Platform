import api from "./axios";
import { setToken } from "./storage";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/users/login", payload);

  setToken(response.data.access_token);
  return response.data;
}
