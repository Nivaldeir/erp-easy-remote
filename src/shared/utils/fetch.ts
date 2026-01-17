import type { ApiResponse } from "../types/api";

export interface ServerFetchConfig {
  baseUrl?: string;
  requireAuth?: boolean;
  token?: string | null;
}

export interface FetchOptions extends Omit<RequestInit, "body"> {
  requireAuth?: boolean;
  body?: unknown;
  token?: string | null;
}


export class Fetch {
  private baseUrl: string;
  private defaultRequireAuth: boolean;
  private defaultToken?: string | null;

  constructor(config?: ServerFetchConfig) {
    this.baseUrl = config?.baseUrl ?? process.env.API_BACKEND ?? "http://localhost:3001";
    this.defaultRequireAuth = config?.requireAuth ?? true;
    this.defaultToken = config?.token;
  }

  /** Monta URL completa */
  private buildUrl(endpoint: string): string {
    return endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
  }

  /** Detecta FormData */
  private isFormData(body: unknown): body is FormData {
    return typeof FormData !== "undefined" && body instanceof FormData;
  }

  /** Obtém header com token (quando necessário) */
  private async getAuthHeader(requireAuth: boolean, providedToken?: string | null): Promise<Record<string, string>> {
    if (!requireAuth) return {};

    // Prioridade: token fornecido nas opções > token do construtor > tentar obter sessão do servidor
    const token = providedToken ?? this.defaultToken;

    if (token) {
      return { Authorization: `Bearer ${token}` };
    }

    // Tenta obter sessão do servidor apenas se estiver no servidor
    if (typeof window === "undefined") {
      try {
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("../config/auth");
        const session = await getServerSession(authOptions);

      } catch (error) {
        // Ignora erros de importação em build time
        console.warn("Could not get server session:", error);
      }
    }

    throw new Error("Não autenticado. Token de acesso não encontrado.");
  }

  /** Método principal */
  async fetch<T extends ApiResponse<unknown>>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const {
      requireAuth = this.defaultRequireAuth,
      method = "GET",
      body,
      headers = {},
      token,
      ...rest
    } = options;

    // Headers padrão que sempre devem ser incluídos
    const defaultHeaders: Record<string, string> = {
      "x-api-key": process.env.API_KEY_AUTH || "",
      "x-client-secret": process.env.CLIENT_SECRET_AUTH || "",
    };

    // Mescla headers padrão com headers customizados (customizados têm prioridade)
    const requestHeaders: Record<string, string> = {
      ...defaultHeaders,
      ...(headers as Record<string, string> || {}),
    };

    // Token (usa o token das opções se fornecido)
    Object.assign(requestHeaders, await this.getAuthHeader(requireAuth, token));

    // Ajuste do corpo
    let finalBody: BodyInit | undefined;

    if (body !== undefined && body !== null) {
      if (this.isFormData(body)) {
        finalBody = body;
      } else {
        requestHeaders["Content-Type"] = "application/json";
        finalBody = JSON.stringify(body);
      }
    }

    const response = await globalThis.fetch(this.buildUrl(endpoint), {
      method,
      headers: requestHeaders,
      body: ["GET", "DELETE"].includes(method) ? undefined : finalBody,
      ...rest,
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        json?.message ||
        json?.error?.message ||
        `Erro na requisição: ${response.status} ${response.statusText}`;

      throw new Error(message);
    }

    if (json?.success === false) {
      throw new Error(json?.error?.message || "Erro na resposta da API");
    }

    return json as T;
  }

  // Métodos convenientes
  get<T extends ApiResponse<unknown>>(endpoint: string, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { ...options, method: "GET" });
  }

  post<T extends ApiResponse<unknown>>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { ...options, method: "POST", body });
  }

  put<T extends ApiResponse<unknown>>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { ...options, method: "PUT", body });
  }

  patch<T extends ApiResponse<unknown>>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { ...options, method: "PATCH", body });
  }

  delete<T extends ApiResponse<unknown>>(endpoint: string, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { ...options, method: "DELETE" });
  }
}
