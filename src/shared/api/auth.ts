import { http } from "./http";

export type LoginPayload = { username: string; password: string };
export type LoginResponse = { accessToken: string; refreshToken: string };
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    username: string;
    role: string;
  };
}

export async function apiLogin(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await http.post<AuthResponse>("/auth", payload);
  const accessToken = data.access_token;
  const refreshToken = data.refresh_token;
  return { accessToken, refreshToken };
}

interface RefreshResponse {
  access_token: string;
  expires_in: number;
}

export async function apiRefresh(refreshToken: string): Promise<{ accessToken: string }> {
  const { data } = await http.post<RefreshResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });
  return { accessToken: data.access_token };
}
