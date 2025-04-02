import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        'Content-Type': 'application/json', // Ensure JSON is used for requests
    },
});

export default api;