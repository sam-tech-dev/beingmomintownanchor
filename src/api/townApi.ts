import client from './client';

export type Town = {
  _id: string;
  name: string;
  post: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
};

export type AddTownPayload = {
  name: string;
  post?: string;
  block?: string;
  district: string;
  state: string;
  pincode: string;
};

export const listTowns = () =>
  client.get<{ towns: Town[] }>('/api/town/list');

export const addTown = (data: AddTownPayload) =>
  client.post<{ town: Town }>('/api/town/add', data);
