import {getAxiosInstance} from '.';
import axios from 'axios';

export const getShifts = async () => {
  const api = getAxiosInstance();
  const {data} = await api.get('/shifts?order[date]=DESC&order[startTime]=ASC');
  return data;
};

export const getShiftById = async (id: string) => {
  const api = getAxiosInstance();
  const {data} = await api.get(`/shifts/${id}`);
  return data;
};

export const createShifts = async (payload: any) => {
  const api = getAxiosInstance();
  const {data} = await api.post('/shifts', payload);
  return data;
};

export const updateShiftById = async (id: string, payload: any) => {
  const api = getAxiosInstance();
  const {data} = await api.patch(`/shifts/${id}`, payload);
  return data;
};

export const deleteShiftById = async (id: string) => {
  const api = getAxiosInstance();
  const {data} = await api.delete(`/shifts/${id}`);
  return data;
};

// I don't know why it can't hit backend so I tried another way

// export const publishShiftById = async (payload: any) => {
//   const api = getAxiosInstance();
//   console.log('payload', payload);
//   const {data} = await api.patch(`/shifts/publish`, payload);
//   return data;
// };

export const publishShiftById = async (payload: any) => {
  console.log('payload', payload);

  const {data} = await axios({
    method: 'PATCH',
    url: `${process.env.REACT_APP_API_BASE_URL}/shifts/publish`,
    data: {
      shiftArrId: payload,
    },
  });
  console.log(data);
  return data;
};
