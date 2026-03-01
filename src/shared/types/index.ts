export type User = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: "active" | "inactive";
  createdAt: string;
};

export type UsersPagination = {
  total: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
};

export type UsersListResponse = {
  data: User[];
  pagination: UsersPagination;
};
