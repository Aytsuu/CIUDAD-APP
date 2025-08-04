import axios from 'axios';

export const api = axios.create({
    baseURL: "http://172.16.88.96:8000",
    headers: {
        'Content-Type': 'application/json', // Ensure JSON is used for requests
    }, 
});
