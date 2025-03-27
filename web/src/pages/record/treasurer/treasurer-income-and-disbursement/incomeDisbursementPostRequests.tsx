import api from '@/api/api';

const fetchFiles = async () => {
    try {
        const response = await api.get('treasurer/income-disbursement-files/'); // Adjust the endpoint as necessary
        return response.data; // Assuming the response contains the files in the data property
    } catch (error) {
        console.error("Error fetching files:", error);
        return [];
    }
};