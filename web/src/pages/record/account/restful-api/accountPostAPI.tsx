import api from "@/api/api";

export const addAccount = async (accountInfo: Record<string, string>) => {
  try {
    const res = await api.post('api/signup/', {
      username: accountInfo.username,
      email: accountInfo.email,
      password: accountInfo.password
    })

    return res.data
  } catch (err) {
    console.error(err);
  }
}