import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 5000
});

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('vuems_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        console.log(error);
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.status === 200) {
            return response.data;
        }
        return Promise.reject(response);
    },
    (error: AxiosError) => {
        const message = (error.response?.data as { message?: string } | undefined)?.message || error.message || '请求失败';
        ElMessage.error(message);
        return Promise.reject(error);
    }
);

const request = <T = unknown>(config: AxiosRequestConfig) => {
    return service.request<unknown, T>(config);
};

export default request;
