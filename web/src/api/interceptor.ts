import { store } from "@/redux/store";
import { updateAccessToken, clearAuthState } from "@/redux/auth-redux/authSlice";
import { queryClient } from "@/lib/queryClient";
import { api } from "./api";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({resolve, reject}) => {
        if(error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    failedQueue = [];
}

export const setupApiInterceptor = (apiInstance: typeof api) => {
    apiInstance.defaults.withCredentials = true;

    // Request Interceptor before the server is called
    apiInstance.interceptors.request.use(
        (config) => {
            const state = store.getState();
            const token = state.auth.accessToken;

            if(token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => {return Promise.reject(error);}
    )
    
    // Response Interceptor this is after calling the server
    apiInstance.interceptors.response.use(
        (response) => response,
        async(error) => {
            const originalRequest = error.config;

            if(error.response?.status == 401 && !originalRequest._retry){
                if(isRefreshing){
                    return new Promise((resolve, reject) => {
                        failedQueue.push({resolve, reject});
                    }).then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiInstance(originalRequest);
                    }).catch((err) => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const response = await apiInstance.post('api/token/refresh/');
                    const newToken = response.data.access;

                    store.dispatch(updateAccessToken(newToken));
                    processQueue(null, newToken);

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiInstance(originalRequest);
                } catch (refreshError){
                    processQueue(refreshError, null);
                    store.dispatch(clearAuthState());

                    // Clear all React Query cache with auth fails
                    queryClient.clear()
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    )
}