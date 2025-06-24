// import axios from 'axios';

// export const api = axios.create({
//     baseURL: "http://localhost:8000",
//     headers: {
//         'Content-Type': 'application/json', // Ensure JSON is used for requests
//     },
// });

// export const api2 = axios.create({
//     baseURL: "http://localhost:8001",
//     headers: {
//         'Content-Type': 'application/json', // Ensure JSON is used for requests
//     },
// });



import axios from 'axios';
import supabase from '@/supabase/supabase';

export const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api2 = axios.create({
    baseURL: "http://localhost:8001",
    headers: {
        'Content-Type': 'application/json', // Ensure JSON is used for requests
    },
});

