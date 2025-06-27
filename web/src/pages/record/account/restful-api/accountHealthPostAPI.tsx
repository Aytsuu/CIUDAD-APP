import { api2 } from "@/api/api";

export const addAccountHealth = async (accountInfo: Record<string, string>, residentId: string) => {
  try { 
    const res = await api2.post('user/signup/', {
      username: accountInfo.username,
      email: accountInfo.email,
      password: accountInfo.password,
      rp: residentId
    })

    return res.data
  } catch (err) {
    console.error(err);
  }
}