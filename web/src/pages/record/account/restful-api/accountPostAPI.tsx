import api from "@/api/api";

export const addAccount = async (accountInfo: Record<string, string>, residentId: string) => {
  try { 
    const res = await api.post('user/signup/', {
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