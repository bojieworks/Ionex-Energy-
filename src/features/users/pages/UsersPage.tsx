import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiGetUsers } from "@/shared/api/users";
import type { User } from "@/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import { authStore } from "@/shared/stores/authStore";
import { useToast } from "@/shared/components/ui/toast";
import { Badge } from "@/shared/components/ui/badge";

function useUsersQueryParams() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, Number(params.get("limit") || "10")));
  const email = params.get("email") || "";
  const name = params.get("name") || "";
  const status = (params.get("status") as "active" | "inactive" | null) || null;

  const setParam = (key: string, value: string | number | null | undefined) => {
    const next = new URLSearchParams(params);
    if (value == null || value === "") next.delete(key);
    else next.set(key, String(value));
    setParams(next, { replace: true });
  };

  return {
    page,
    limit,
    email,
    name,
    status,
    setPage: (p: number) => setParam("page", p),
  };
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "destructive" | "outline" | "secondary" | "success" | "warning" =
    "default";

  let className = "";
  switch (status) {
    case "active":
      variant = "secondary";
      className = "bg-green-100 text-green-800 border-green-200";
      break;
    case "inactive":
      variant = "secondary";
      className = "bg-gray-100 text-gray-800 border-gray-200";
      break;
    default:
      variant = "destructive";
      className = "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}

function UsersGrid({ users }: { users: User[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden">
          <CardHeader className="flex-row items-center gap-2">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <CardTitle className="">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <StatusBadge status={user.status} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UsersSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex-row items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-30" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-5 w-20 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const go = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    onChange(p);
  };
  const pages = Array.from({ length: totalPages }).map((_, i) => i + 1);
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <Button variant="outline" onClick={() => go(page - 1)} disabled={page <= 1}>
        上一頁
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        {pages.map((p) => (
          <Button key={p} variant={p === page ? "default" : "outline"} onClick={() => go(p)}>
            {p}
          </Button>
        ))}
      </div>
      <Button variant="outline" onClick={() => go(page + 1)} disabled={page >= totalPages}>
        下一頁
      </Button>
    </div>
  );
}

export default function UsersPage() {
  const { page, limit, email, name, status, setPage } = useUsersQueryParams();
  const { error: showError, success } = useToast();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users", { page, limit, email, name, status }],
    queryFn: () =>
      apiGetUsers({
        page,
        limit,
        email,
        name,
        status,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      const message = (error as any)?.response?.data?.message || "讀取使用者失敗";
      showError(message);
    }
  }, [isError]);

  const logout = () => {
    authStore.getState().logout();
    success("已登出");
    navigate("/login", { replace: true });
  };

  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="container-responsive py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">使用者列表</h1>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={logout}>
            登出
          </Button>
        </div>
      </div>

      {isLoading ? (
        <UsersSkeleton />
      ) : isError ? (
        <div className="rounded-md border bg-card p-6 text-center">
          <p className="text-muted-foreground mb-4">讀取資料發生錯誤</p>
          <Button onClick={() => refetch()}>重試</Button>
        </div>
      ) : (
        <>
          <UsersGrid users={data!.data} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
