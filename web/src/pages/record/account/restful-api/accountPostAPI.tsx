// import { api } from "@/api/api";

// export const addAccount = async (accountInfo: Record<string, string>, residentId: string) => {
//   try { 
//     const res = await api.post('user/signup/', {
//       username: accountInfo.username,
//       email: accountInfo.email,
//       password: accountInfo.password,
//       rp: residentId
//     })

//     return res.data
//   } catch (err) {
//     console.error(err);
//   }
// }
// accountPostAPI.ts
import { api } from "@/api/api";
import supabase from "@/supabase/supabase";

export const addAccount = async (accountInfo: Record<string, string>, residentId: string) => {
  try {
    // 1. First register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: accountInfo.email,
      password: accountInfo.password,
      options: {
        data: {
          username: accountInfo.username,
          resident_id: residentId
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

    // 2. Then send to Django API with the Supabase user ID
    const response = await api.post('authentication/signup/', {
      supabase_id: authData.user.id,
      username: accountInfo.username,
      email: accountInfo.email,
      rp: residentId  // This should match the field name in your ResidentProfile model
    });

    return response.data;
  } catch (err: any) {
    console.error('Account creation failed:', err);
    
    let errorMessage = 'Failed to create account';
    if (err.response) {
      // Handle Django backend errors
      errorMessage = err.response.data?.error || errorMessage;
    } else if (err.message) {
      // Handle Supabase or other errors
      errorMessage = err.message;
    }
    
    throw new Error(errorMessage);
  }
}