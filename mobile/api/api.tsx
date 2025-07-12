import axios from 'axios';

export const api = axios.create({
    baseURL: "http://10.50.13.47:8000",
    headers: {
        'Content-Type': 'application/json', // Ensure JSON is used for requests
    }, 
});
