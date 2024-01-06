import axios, { InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Create an Axios instance
const api = axios.create({
    baseURL: '/api',
});

// Adds token from cookies to Authorization header if it exists to every request
export function authorizationInterceptor(internalAxiosRequestConfig: InternalAxiosRequestConfig) {
    const token = Cookies.get('token');
    if (token) {
        internalAxiosRequestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return internalAxiosRequestConfig;
}
api.interceptors.request.use(authorizationInterceptor);

export default api;