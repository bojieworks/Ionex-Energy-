import { http } from "./http";
import type { UsersListResponse, User } from "@/shared/types";

/**
 * Query params for listing users
 */
export type GetUsersParams = {
  email?: string;
  name?: string;
  status?: UserStatus;
  page?: number;
  limit?: number;
};

/**
 * User status literals used by both API DTOs and domain types
 */
type UserStatus = "active" | "inactive" | null;

/**
 * User object as returned by the API (DTO)
 */
interface UserApi {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: UserStatus;
  created_at: string;
}

/**
 * Pagination object as returned by the API (DTO)
 */
interface UsersPaginationApi {
  total: number;
  current_page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Full API response shape for users list
 */
interface UsersListApiResponse {
  data: UserApi[];
  pagination: UsersPaginationApi;
}

/**
 * Map a single API user (DTO) to the app's domain `User` type
 */
function mapUser(user: UserApi): User {
  return {
    id: Number(user.id),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    avatar: String(user.avatar ?? ""),
    status: (user.status as UserStatus) ?? "inactive",
    createdAt: String(user.created_at ?? ""),
  };
}

/**
 * Calculate total pages from total items and perPage
 */
function calcTotalPages(total: number, perPage: number): number {
  const p = Math.max(1, Number(perPage) || 10);
  const t = Math.max(0, Number(total) || 0);
  return Math.max(1, Math.ceil(t / p));
}

/**
 * Map API pagination (DTO) to the app's pagination shape used in `UsersListResponse`
 */
function mapPagination(
  p: Partial<UsersPaginationApi> | undefined,
  fallback: { page: number; limit: number; total: number },
) {
  const total = Number(p?.total ?? fallback.total);
  const perPage = Number(p?.per_page ?? fallback.limit);
  const currentPage = Number(p?.current_page ?? fallback.page);
  const totalPages = Number(p?.total_pages ?? calcTotalPages(total, perPage));

  return { total, currentPage, perPage, totalPages };
}

/**
 * Fetch users list from API and map to domain types with robust pagination defaults
 */
export async function apiGetUsers(params: GetUsersParams = {}): Promise<UsersListResponse> {
  const query = {
    email: params.email || undefined,
    name: params.name || undefined,
    status: params.status || undefined,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  } as const;

  const { data } = await http.get<UsersListApiResponse>("/api/users", { params: query });

  const users = Array.isArray(data?.data) ? data.data.map(mapUser) : [];

  const pagination = mapPagination(data?.pagination, {
    page: query.page,
    limit: query.limit,
    total: users.length,
  });

  return { data: users, pagination };
}
