import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { setAccessToken } from "@/api/api";
import { AuthState, User } from "./auth-types";


const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    otpSent: false,
    email: null,
}


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
        setOtpSent: (state, action: PayloadAction<{sent: boolean; email?: string}>) =>{
            state.otpSent = action.payload.sent;
            if(action.payload.email) {
                state.email = action.payload.email;
            }
        },
        clearOtpState: (state) => {
            state.otpSent = false;
            state.email = null;
        },
        setAuthData: (state, action: PayloadAction<{access: string; user: User}>) => {
            state.accessToken = action.payload.access;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;

            // setAccessToken(action.payload.access);
        },
        updateAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
            state.isAuthenticated = true;

            // setAccessToken(action.payload);
        },
        clearAuthState: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.error = null;
            state.otpSent = false;
            state.email = null;

            // setAccessToken(null);
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
    clearAuthState,
} = authSlice.actions;

export default authSlice.reducer;