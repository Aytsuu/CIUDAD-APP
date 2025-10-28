export interface User {
    acc_id: string;
    email: string;
    phone: string;
    profile_image?: string;
    personal: Record<string, any>;
    br?: string
    rp?: string
    staff?: Record<string, any>;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    hasCheckedAuth: boolean;
    otpSent: boolean;
    email: Record<string, any> | null;
    phone: string | null;
}

export interface LoginCredentials {
    email?: string;
    phone?: string;
    otp: string;
}

export interface SignupCredentials {
    email: string;
    password: string;
    username?: string;
}

export interface TokenResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface SignupResponse {
    access_token?: string;
    refresh_token?: string;
    user?: User;
    requireConfirmation?: boolean;
}

export interface OTPCredentials {
    phone: string;
    otp: string;
}

export interface EmailOTPCredentials {
    email: string;
    otp: string;
}