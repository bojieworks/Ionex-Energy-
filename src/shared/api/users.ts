import { http } from "./http";
import type { UsersListResponse, User } from "@/shared/types";

export type GetUsersParams = {
  email?: string;
  name?: string;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
};

function mapUser(u: any): User {
  return {
    id: Number(u.id),
    name: String(u.name ?? ""),
    email: String(u.email ?? ""),
    avatar: String(u.avatar ?? ""),
    status: (u.status as "active" | "inactive") ?? "inactive",
    createdAt: String(u.created_at ?? ""),
  };
}

export async function apiGetUsers(params: GetUsersParams = {}): Promise<UsersListResponse> {
  const query = {
    email: params.email || undefined,
    name: params.name || undefined,
    status: params.status || undefined,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  };

  const { data } = await http.get<any>("/api/users", { params: query });

  const users = Array.isArray(data?.data) ? data.data.map(mapUser) : [];
  const p = data?.pagination ?? {};
  const pagination = {
    total: Number(p.total ?? users.length),
    currentPage: Number(p.current_page ?? query.page ?? 1),
    perPage: Number(p.per_page ?? query.limit ?? 10),
    totalPages: Number(
      p.total_pages ??
        Math.max(1, Math.ceil((p.total ?? users.length) / (p.per_page ?? query.limit ?? 10))),
    ),
  };

  return { data: users, pagination };
}
