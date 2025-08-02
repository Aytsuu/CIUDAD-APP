import { api } from "@/api/api"
import { User } from "@/context/auth-types"


export const fetchAllAccounts = async (): Promise<User[]> => {
    const response = await api.get('/accounts/');
    return response.data
}

export const fetchAccountsByType = async(type: 'Barangay Staff' | 'Health Staff'): Promise<User[]> => {
    const response = await api.get(`/accounts/?type=${type}`);
    return response.data
}