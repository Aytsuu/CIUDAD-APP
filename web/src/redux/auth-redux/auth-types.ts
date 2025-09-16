export interface User {
    acc_id: string;
    email: string;
    username: string;
    profile_image?: string | null;
    resident?: Record<string, any>;
    staff?: Record<string, any>;
}


export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    otpSent: boolean;
    email: string | null;
}

export interface LoginCredentials {
    email?: string;
    password: string;
    phonr?: string;
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