import { KeychainService } from '@/services/keychainService';
import { store } from "@/redux/store";
import { updateAccessToken, clearAuthState } from '@/redux/auth-redux/authSlice';
import { queryClient } from "@/lib/queryClient";
import { api } from "./api";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

export const setupApiInterceptor = (apiInstance: typeof api) => {
    // Request interceptor to add access token to headers
    apiInstance.interceptors.request.use(
        (config) => {
            console.log(`🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
            
            const state = store.getState();
            const accessToken = state.auth.accessToken;
            
            if (accessToken && !config.url?.includes('/token/')) { 
                config.headers.Authorization = `Bearer ${accessToken}`;
                console.log('🔑 Access token added to request');
            }
            
            return config;
        },
        (error) => {
            console.error('❌ Request interceptor error:', error);
            return Promise.reject(error);
        }
    );

    // Response interceptor to handle token refresh
    apiInstance.interceptors.response.use(
        (response) => {
            console.log(`✅ Response received: ${response.status} ${response.statusText}`);
            return response;
        },
        async (error) => {
            const originalRequest = error.config;
            
            console.log(`❌ Response error: ${error.response?.status} ${error.response?.statusText}`);
            
            // Check if error is 401 and we haven't already tried to refresh
            if (error.response?.status === 401 && !originalRequest._retry) {
                
                // Skip refresh attempt for login/register endpoints
                if (originalRequest.url?.includes('/token/') || 
                    originalRequest.url?.includes('/register/') ||
                    originalRequest.url?.includes('/login/')) {
                    console.log('🚫 Skipping token refresh for auth endpoints');
                    return Promise.reject(error);
                }

                originalRequest._retry = true;

                if (isRefreshing) {
                    console.log('⏳ Token refresh already in progress, queuing request...');
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        if (token) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiInstance(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                isRefreshing = true;
                console.log('🔄 Starting token refresh...');

                try {
                    const refreshToken = await KeychainService.getRefreshToken();
                    
                    if (!refreshToken) {
                        console.log('🚫 No refresh token found, redirecting to login');
                        throw new Error('No refresh token available');
                    }

                    const refreshResponse = await apiInstance.post('/api/token/refresh/', {
                        refresh: refreshToken
                    });

                    const { access: newAccessToken, refresh: newRefreshToken } = refreshResponse.data;
                    
                    if (!newAccessToken) {
                        throw new Error('No access token in refresh response');
                    }

                    console.log('✅ Token refresh successful');
                    
                    // Update access token in Redux store
                    store.dispatch(updateAccessToken(newAccessToken));
                    
                    // Update refresh token in keychain if a new one was provided
                    if (newRefreshToken) {
                        console.log('🔄 Updating refresh token in keychain');
                        await KeychainService.setRefreshToken(newRefreshToken);
                    }

                    // Update the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    
                    // Process queued requests
                    processQueue(null, newAccessToken);
                    
                    isRefreshing = false;
                    
                    // Retry the original request
                    return apiInstance(originalRequest);
                    
                } catch (refreshError) {
                    console.error('❌ Token refresh failed:', refreshError);
                    
                    store.dispatch(clearAuthState());
                    await KeychainService.removeRefreshToken();
                    
                    queryClient.clear();
                    
                    processQueue(refreshError, null);
                    
                    isRefreshing = false;
                    
                    // You might want to navigate to login screen here
                    // NavigationService.navigate('Login');
                    
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};