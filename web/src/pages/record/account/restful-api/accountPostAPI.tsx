import { api } from "@/api/api";

export const addAccount = async (accountInfo: Record<string, any>, residentId: string) => {
  try {
    const response = await api.post('authentication/signup/', {
      username: accountInfo.username,
      email: accountInfo.email,
      phone: accountInfo.phone,
      password: accountInfo.password,
      resident_id: residentId 
    });

    return response.data;
  } catch (err: any) {
    throw err;
  }
}
