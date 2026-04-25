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
  town: TownSummary | null;
  isVerified: boolean;
  isAdmin: boolean;
};

export type UpdateProfilePayload = {
  name?: string;
  townId?: string;
};

export type UpdateProfileResponse = {
  user: AuthUser;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export const signup = (data: SignupPayload) =>
  client.post<AuthResponse>('/api/townanchor/signup', data);

export const login = (data: LoginPayload) =>
  client.post<AuthResponse>('/api/townanchor/login', data);

export const updateProfile = (data: UpdateProfilePayload) =>
  client.put<UpdateProfileResponse>('/api/townanchor/profile', data);

export type AnchorSummary = AuthUser;

export type ListAnchorsResponse = {
  anchors: AnchorSummary[];
  pagination: { total: number; page: number; totalPages: number; hasNextPage: boolean };
};

export const listAnchors = (params?: { page?: number; q?: string }) =>
  client.get<ListAnchorsResponse>('/api/townanchor', { params });

export const setVerification = (id: string, verified: boolean) =>
  client.patch<{ user: AnchorSummary }>(`/api/townanchor/${id}/verify`, { verified });
