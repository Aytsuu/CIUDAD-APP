import { api } from "@/api/api";

export const addAccount = async (accountInfo: Record<string, string>, residentId: string) => {
  try {
    const response = await api.post('authentication/signup/', {
      username: accountInfo.username,
      email: accountInfo.email,
      password: accountInfo.password,
      resident_id: residentId 
    });

    return response.data;
  } catch (err: any) {
    console.error('Account creation failed:', err);
    
    let errorMessage = 'Failed to create account';
    if (err.response) {
      errorMessage = err.response.data?.error || errorMessage;
    } else if (err.message) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}