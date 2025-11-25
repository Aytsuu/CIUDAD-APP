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
    otpSent: boolean;
    email: Record<string, any> | null;
}

export interface LoginCredentials {
    email?: string;
    otp: string;
    phone?: string;
}

export interface SignupCredentials {
    email: string;
    password: string;
}

export interface TokenResponse {
    access: string;
    user: User;
}

export interface OTPResponse {
    message: string;
}

export interface SignupResponse extends TokenResponse {
    requiresConfirmation?: boolean;
}