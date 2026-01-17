/**
 * Tipos para respostas da API
 */

// Tipos de resposta genérica da API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Tipos de paginação
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos de autenticação
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  userId: number;
  clientId: string;
  accountId: number;
  document: string;
  email: string;
  type: string;
  iat: number;
  isAdmin: boolean;
  tenantId: string;
  tenantSchema: string;
  tenantName: string;
  twoFactorAuth: boolean;
}

export interface Account {
  clientId: number;
  type: string;
  accountId: number;
  accountNumber: string;
  agency: string;
  name: string;
  document: string;
}

export interface LoginData {
  token: string;
  tokenExpiration: string;
  twoFactorAuth: boolean;
  user: LoginUser;
  accounts: Account[];
  invitedAccounts: unknown[];
}

export interface LoginResponse extends ApiResponse<LoginData> {
  success: true;
  message: string;
  data: LoginData;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  // Campos adicionais da API
  userId?: number;
  clientId?: string;
  accountId?: number;
  document?: string;
  type?: string;
  isAdmin?: boolean;
  tenantId?: string;
  tenantSchema?: string;
  tenantName?: string;
  twoFactorAuth?: boolean;
  twoFactorVerified?: boolean;
  accounts?: Account[];
  invitedAccounts?: Account[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

// Tipos de sessão
export interface Session {
  user: User;
  accessToken: string;
  expires: string;
}

// Tipos de permissões
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

