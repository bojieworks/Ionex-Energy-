import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { authStore } from "@/shared/stores/authStore";
import { apiRefresh } from "@/shared/api/auth";

export type ApiError = {
  message: string;
  code?: string;
};

const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) throw new Error("VITE_API_BASE_URL is not defined!");

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
const TOKEN_EXPIRED_CODE = "TOKEN_EXPIRED";
function createHttp(): AxiosInstance {
  const instance = axios.create({ baseURL, timeout: 15000 });

  // Request interceptor: attach access token
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = authStore.getState().accessToken;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: handle TOKEN_EXPIRED and retry once after single-flight refresh
  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError<any>) => {
      const originalConfig = error.config as AxiosRequestConfig & { _retry?: boolean };
      const status = error.response?.status;
      const code = (error.response?.data as ApiError | undefined)?.code;

      if (status === 401 && code === TOKEN_EXPIRED_CODE && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          // Ensure a single refresh in-flight
          if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = refreshAccessToken()
              .catch(() => null)
              .finally(() => {
                isRefreshing = false;
              });
          }

          const newToken = await (refreshPromise as Promise<string | null>);

          if (!newToken) {
            authStore.getState().logout();
            return Promise.reject(error);
          }

          // Retry the original request with the new token
          return await retryRequestWithToken(originalConfig, newToken);
        } catch (e) {
          authStore.getState().logout();
          return Promise.reject(e);
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens } = authStore.getState();
  if (!refreshToken) return null;

  try {
    const { accessToken: newAccessToken } = await apiRefresh(refreshToken);
    if (newAccessToken) setTokens({ accessToken: newAccessToken });
    return newAccessToken;
  } catch (e) {
    return null;
  }
}

async function retryRequestWithToken(config: AxiosRequestConfig, token: string) {
  const newConfig: AxiosRequestConfig = { ...config };
  newConfig.headers = newConfig.headers ?? {};
  (newConfig.headers as any).Authorization = `Bearer ${token}`;
  return axios(newConfig);
}

export const http = createHttp();
