import client from './client';

export type TownSummary = {
  _id: string;
  name: string;
  district: string;
  state: string;
};

export type SignupPayload = {
  name: string;
  phone: string;
  townId: string;
  password: string;
};

export type LoginPayload = {
  phone: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  phone: string;
  town: TownSummary;
  isVerified: boolean;
  isAdmin: boolean;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export const signup = (data: SignupPayload) =>
  client.post<AuthResponse>('/api/townanchor/signup', data);

export const login = (data: LoginPayload) =>
  client.post<AuthResponse>('/api/townanchor/login', data);
