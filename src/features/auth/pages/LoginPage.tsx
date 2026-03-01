import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useToast } from "@/shared/components/ui/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { apiLogin } from "@/shared/api/auth";
import { authStore } from "@/shared/stores/authStore";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const isAuthed = authStore((auth) => auth.getIsAuthenticated());
  const login = authStore((auth) => auth.login);

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  if (isAuthed) return <Navigate to="/users" replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrMsg(null);
    setLoading(true);
    try {
      const { accessToken, refreshToken } = await apiLogin({ username, password });
      login({ accessToken, refreshToken });
      success("登入成功");
      navigate("/users", { replace: true });
    } catch (e: unknown) {
      let message = "登入失敗，請確認帳號密碼";
      if (axios.isAxiosError(e)) {
        message = e.response?.data?.message ?? message;
      }
      setErrMsg(message);
      error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-responsive flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>登入</CardTitle>
          <CardDescription>請輸入使用者名稱與密碼</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="username">
                使用者名稱
              </label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                密碼
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {errMsg && <p className="text-sm text-destructive">{errMsg}</p>}
            <Button type="submit" className="w-full" loading={loading} disabled={loading}>
              {loading ? "登入中..." : "登入"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
