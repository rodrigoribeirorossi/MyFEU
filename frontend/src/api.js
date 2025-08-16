import axios from 'axios';
const API_URL = 'http://localhost:8000';

export const getWidgets = async () => {
  const resp = await axios.get(`${API_URL}/widgets/`);
  return resp.data;
};

export const getDashboard = async (userId) => {
  const resp = await axios.get(`${API_URL}/user/${userId}/dashboard/`);
  return resp.data;
};

export const addWidget = async (userId, widget) => {
  const resp = await axios.post(`${API_URL}/user/${userId}/widgets/`, widget);
  return resp.data;
};