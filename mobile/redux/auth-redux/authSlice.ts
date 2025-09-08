import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { KeychainService } from "@/services/keychainService";
import { AuthState, User } from "./auth-types";

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    hasCheckedAuth: false,
    otpSent: false,
    email: null,
    phone: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setOtpSent: (state, action: PayloadAction<{sent: boolean; email?: string; phone?: string}>) => {
            state.otpSent = action.payload.sent;
            if(action.payload.email) {
                state.email = action.payload.email;
            }
            if(action.payload.phone){
                state.phone = action.payload.phone;
            }
        },
        clearOtpState: (state) => {
            state.otpSent = false;
            state.email = null;
            state.phone = null;
        },
        setAuthData: (state, action: PayloadAction<{accessToken: string; user: User; refreshToken?: string}> )=> {
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.hasCheckedAuth = true;
            state.error = null;
            if(action.payload.refreshToken) {
                KeychainService.setRefreshToken(action.payload.refreshToken)
            }
        },
        updateAccessToken : (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
            state.isAuthenticated = true;
        },
        setAuthChecked: (state) => {
            state.hasCheckedAuth = true;
        },
        clearAuthState: (state) => {
            state.user = null;
            state.accessToken = null; 
            state.isAuthenticated = false;
            state.error = null;
            state.otpSent = false;
            state.email = null;
            state.phone = null;
            state.hasCheckedAuth = true;
            KeychainService.removeRefreshToken();
        },
    },
});

export const {
  setLoading,
  setError,
  clearError,
  setOtpSent,
  clearOtpState,
  setAuthData,
  updateAccessToken,
  setAuthChecked,
  clearAuthState,
} = authSlice.actions;

export default authSlice.reducer;