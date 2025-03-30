// This file contains utility functions for authentication, such as fetching the user and handling tokens.

import axios from 'axios';
import { User } from './auth/authTypes';

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

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};