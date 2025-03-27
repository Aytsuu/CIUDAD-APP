// This file contains all the API calls related to authentication.

import axios from 'axios';
import { User } from '../context/authTypes';

export const login = async (username: string, password: string) => {
  const response = await axios.post('http://localhost:8000/api/auth/login/', {
    username,
    password,
  });
  return response.data;
};

export const register = async (username: string, email: string, password: string) => {
  const response = await axios.post('http://localhost:8000/api/auth/register/', {
    username,
    email,
    password,
  });
  return response.data;
};

export const fetchUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  try {
    const response = await axios.get('http://localhost:8000/api/auth/user/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
};