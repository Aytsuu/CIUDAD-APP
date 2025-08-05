import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a new annual development plan
export const createAnnualDevPlan = async (data: any) => {
  const res = await api.post('/gad/gad-annual-development-plan/', data);
  return res.data;
};
