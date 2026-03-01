# Ionex-Energy Admin（React + TypeScript）

一個以 Vite 建置的 React 18 + TypeScript 後台管理樣板。整合 TanStack Query、Zustand、Axios、TailwindCSS 與類 shadcn/ui 的 UI 元件，提供登入保護、使用者清單、Token 自動刷新、全域 Toast 與 Skeleton，支援 CSR 與 RWD。

## 快速開始
1) 安裝環境
- Node.js 18+（建議 20+）
- 套件管理：pnpm（建議）或 npm / yarn

2) 安裝依賴
```bash
pnpm i  # 或 npm i / yarn
```

3) 設定環境變數（必要）
在專案根目錄建立 `.env` 檔，並設定 API 伺服器位址：
```bash
# .env
VITE_API_BASE_URL=http://localhost:3000/api
```
注意：`src/shared/api/http.ts` 會直接讀取 `VITE_API_BASE_URL`，若未設定會丟出錯誤並中止啟動。

4) 啟動開發伺服器
```bash
pnpm dev
```

5) 打包與預覽
```bash
pnpm build
pnpm preview
```

## 主要功能
- 登入頁：呼叫 `POST /login`，成功後儲存 Token 並導向使用者列表。
- 使用者列表：`GET /users?page=X`，顯示頭像、姓名、Email 與狀態，含分頁、Loading Skeleton、錯誤提示、RWD 卡片。
- Token 管理：Access Token 有效期 300 秒；若 API 回傳 `401` 且 `code = "TOKEN_EXPIRED"`，會自動呼叫 `POST /refresh` 單一佇列刷新並重試原請求；刷新失敗會自動登出並導回登入頁。
- Axios 封裝：Request/Response Interceptor + 單一刷新（Single-Flight）避免重複刷新。
- 其他：全域 Toast、Skeleton、頁面重新整理後保持登入（LocalStorage 持久化）。


## 專案結構
```
src/
  App.tsx
  index.css
  main.tsx
  features/
    auth/
      pages/
        LoginPage.tsx
    users/
      pages/
        UsersPage.tsx
  shared/
    api/
      auth.ts       # login, refresh API
      http.ts       # Axios 實例 + Token 單一刷新佇列
      users.ts      # users API
    components/
      ProtectedRoute.tsx
      ui/
        button.tsx
        card.tsx
        input.tsx
        skeleton.tsx
        toast.tsx
    stores/
      authStore.ts  # token 狀態（含持久化）、登入/登出/刷新
    types/
      index.ts      # 共用型別（User 等）
    utils/
      cn.ts         # className 合併工具
```

## 架構與設計重點
- 路由與保護頁面：使用 React Router v6；`ProtectedRoute` 將未登入使用者導向登入頁。
- 狀態管理：Zustand 管理 `accessToken`、`refreshToken` 與登入狀態，支援 LocalStorage 持久化。
- 資料取得：TanStack Query 管理快取、請求狀態與重試策略。
- 請求層：Axios instance 內建攔截器，過期自動刷新；刷新以單一佇列避免同時多次刷新。
- UI/樣式：TailwindCSS + 輕量 shadcn/ui 風格元件，支援 RWD 與動畫（`tailwindcss-animate`）。
- 模組路徑別名：`@/*` 指向 `src/*`（見 `tsconfig.json`）。

## 環境變數
- `VITE_API_BASE_URL`（必要）：後端 API base URL。
  - 在瀏覽器端可透過 `import.meta.env.VITE_API_BASE_URL` 讀取。
