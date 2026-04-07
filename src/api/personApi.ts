import client from './client';

export type TownSummary = { _id: string; name: string; district?: string; state?: string };

export type PersonSummary = {
  _id: string;
  name: string;
  profilePhoto: string | null;
  town: TownSummary;
  dateOfBirth: string | null;
  gender: string;
  isAlive: boolean;
};

export type Person = {
  _id: string;
  name: string;
  profilePhoto: string | null;
  mobileNumber: string | null;
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  profession: string | null;
  highestEducation: 'graduate' | 'postgraduate' | null;
  town: TownSummary;
  isAlive: boolean;
  fatherId: PersonSummary | null;
  motherId: PersonSummary | null;
  lifePartnerIds: PersonSummary[];
  addedBy: string;
  createdAt: string;
};

export type ListPersonsParams = { page?: number; q?: string; town?: string };

export const addPerson = (data: FormData) =>
  client.post<{ person: Person }>('/api/person', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updatePerson = (id: string, data: FormData) =>
  client.patch<{ person: Person }>(`/api/person/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const listPersons = (params: ListPersonsParams = {}) =>
  client.get<{ persons: PersonSummary[]; pagination: { total: number; page: number; totalPages: number; hasNextPage: boolean } }>('/api/person/list', { params });

export const searchPersons = (q: string) =>
  client.get<{ persons: PersonSummary[] }>('/api/person/search', { params: { q } });

export const getOnePerson = (id: string) =>
  client.get<{ person: Person & { children: PersonSummary[] } }>(`/api/person/${id}`);
