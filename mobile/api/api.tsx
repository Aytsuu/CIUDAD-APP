import axios from 'axios';

export const api = axios.create({
    baseURL: "http://172.16.82.205:8000",
    headers: {
        'Content-Type': 'application/json', // Ensure JSON is used for requests
    }, 
});
