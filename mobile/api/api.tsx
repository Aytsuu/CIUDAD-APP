import axios from 'axios';

export const api = axios.create({
    baseURL: "http://10.169.99.53:8000",
    headers: {
        'Content-Type': 'application/json', // Ensure JSON is used for requests
    }, 
});
