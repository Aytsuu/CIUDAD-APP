import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api, setAccessToken } from "@/api/api";

export interface User {
  acc_id: string;
  email: string;
  username?: string;
  supabase_id: string;
  profile_image?: string | null;
  resident?: Record<string, any>;
  staff?: Record<string, any>;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasCheckedAuth: boolean;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasCheckedAuth: false,
  refreshToken: null,
};

// AsyncThunks (Handles API calls)
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const response = await api.post("authentication/mobile/login/", {
        email,
        password,
      });

      if (!response.data?.access_token || !response.data?.user) {
        throw new Error("Invalid response from server");
      }

      setAccessToken(response.data.access_token);

      return {
        user: response.data.user,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.error || error?.message || "Login failed"
      );
    }
  }
);

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (phoneNumber: string, thunkAPI) => {
    try {
      const response = await api.post("authentication/mobile/sendOtp/", {
        phone_number: phoneNumber,
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.error || "Failed to send OTP"
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (
    { phoneNumber, otp }: { phoneNumber: string; otp: string },
    thunkAPI
  ) => {
    try {
      const response = await api.post("authentication/mobile/verifyOtp/", {
        phone_number: phoneNumber,
        otp,
      });

      if (response.data?.access_token && response.data?.user) {
        setAccessToken(response.data.access_token);

        return {
          user: response.data.user,
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        };
      }

      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.error || "OTP verification failed"
      );
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signUp",
  async (
    {
      email,
      password,
      username,
    }: { email: string; password: string; username?: string },
    thunkAPI
  ) => {
    try {
      const response = await api.post("authentication/signup/", {
        email,
        password,
        username,
      });

      if (
        !response.data.requiresConfirmation &&
        response.data.user &&
        response.data.access_token
      ) {
        setAccessToken(response.data.access_token);

        return {
          user: response.data.user,
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        };
      }
      return {
        requiresConfirmation: response.data?.requiresConfirmation ?? false,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.error || "Signup failed"
      );
    }
  }
);

export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      const { refreshToken } = state.auth;

      if (!refreshToken) throw new Error("No refresh token");

      const response = await api.post("authentication/mobile/refresh-token/", {
        refresh_token: refreshToken,
      });

      // Fixed the condition - was checking for NOT access_token
      if (response.data?.access_token && response.data?.user) {
        setAccessToken(response.data.access_token);

        return {
          user: response.data.user,
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        };
      }

      throw new Error("Invalid refresh response");
    } catch (error: any) {
      return thunkAPI.rejectWithValue("Session expired - Please Login Again");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const state: any = thunkAPI.getState();
    const { isAuthenticated } = state.auth;
    
    // Only call logout API if user is authenticated
    if (isAuthenticated) {
      await api.post("authentication/logout/");
    }
  } catch (error) {
    // Don't throw error on logout - we want to clear state regardless
    console.warn("Logout API call failed:", error);
  }
  
  // Always clear the access token
  setAccessToken(null);
  return {};
});

// New thunk for checking existing authentication
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      const { refreshToken } = state.auth;

      if (!refreshToken) {
        throw new Error("No refresh token found");
      }

      // Try to refresh the session
      const result = await thunkAPI.dispatch(refreshSession());
      
      if (refreshSession.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error("Failed to refresh session");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue("Authentication check failed");
    }
  }
);

export const sendEmailOTP = createAsyncThunk(
  "auth/sendEmailOTP",
  async({ email }: {email: string}, thunkAPI) => {
    try{
      const response = await api.post("authentication/email/sendOtp/", {
        email,
      });

      return response.data
    } catch(error: any){
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to send Email OTP"
      );
    }
  }
)

export const verifyEmailOTP = createAsyncThunk(
  "auth/verifyEmailOTP",
  async ({email, otp}: {email: string, otp: string}, thunkAPI) => {
    try{
      const response = await api.post("authentication/email/verifyOtp/",{
        email, otp,
      })

      if(response.data.user){
        setAccessToken(response.data.access_token);
        return{
          user:response.data.user,
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        }
      }

      return {
        message: response.data.message,
      };

    }catch (error: any){
      return thunkAPI.rejectWithValue(
        error?.response?.data?.error || "Email OTP verification failed"
      );
    }
  }
)

// Slice

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.refreshToken = null;
      state.hasCheckedAuth = true;
      setAccessToken(null);
    },
    // Add a reducer to set hasCheckedAuth without authentication
    setAuthChecked: (state) => {
      state.hasCheckedAuth = true;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.refreshToken = action.payload.refreshToken;
      state.hasCheckedAuth = true;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.hasCheckedAuth = true;
    });

    // Send OTP
    builder.addCase(sendOtp.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(sendOtp.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(sendOtp.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Verify OTP
    builder.addCase(verifyOtp.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      verifyOtp.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        
        // Only set authentication if we got user data
        if (action.payload.user) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.refreshToken = action.payload.refreshToken;
        }
        state.hasCheckedAuth = true;
        state.error = null;
      }
    );
    builder.addCase(verifyOtp.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // SignUp
    builder.addCase(signUp.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signUp.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      if (action.payload.user) {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.refreshToken = action.payload.refreshToken;
      }
      state.hasCheckedAuth = true;
      state.error = null;
    });
    builder.addCase(signUp.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Check Auth
    builder.addCase(checkAuth.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(checkAuth.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.refreshToken = action.payload.refreshToken;
      state.hasCheckedAuth = true;
      state.error = null;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.refreshToken = null;
      state.hasCheckedAuth = true;
      state.error = null; // Don't show error for failed auth check
    });

    // Refresh Session
    builder.addCase(refreshSession.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      refreshSession.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      }
    );
    builder.addCase(refreshSession.rejected, (state, action: any) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.refreshToken = null;
      state.error = action.payload;
    });

    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.refreshToken = null;
      state.error = null;
    });
    builder.addCase(logout.rejected, (state) => {
      // Even if logout fails, clear the state
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.refreshToken = null;
      state.error = null;
    });

    // Send Email OTP
    builder.addCase(sendEmailOTP.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(sendEmailOTP.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(sendEmailOTP.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Verify Email OTP
    builder.addCase(verifyEmailOTP.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    builder.addCase(verifyEmailOTP.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;

      if(action.payload.user) {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.refreshToken = action.payload.refreshToken;
      }
      state.hasCheckedAuth = true;
    });
    builder.addCase(verifyEmailOTP.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
    })
  },
});

export const { clearError, clearAuthState, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;