import { api } from "@/api/api";
import supabase from "@/supabase/supabase";

export const addAccount = async (accountInfo: Record<string, string>, residentId: string) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: accountInfo.email,
      password: accountInfo.password,
      options: {
        data: {
          username: accountInfo.username,
          rp: residentId
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('No user data returned from Supabase');
    }

    const response = await api.post('authentication/signup/', {
      supabase_id: authData.user.id,
      username: accountInfo.username,
      email: accountInfo.email,
      rp: residentId 
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