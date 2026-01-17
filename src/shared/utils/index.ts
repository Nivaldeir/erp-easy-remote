import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converte um objeto em uma string de query parameters
 * @param params - Objeto com os parâmetros a serem convertidos
 * @param options - Opções de configuração
 * @returns String de query parameters (ex: "?key=value&key2=value2")
 */
export function objectToQueryParams(
  params: Record<string, string | number | boolean | null | undefined | unknown[] | Record<string, unknown>>,
  options?: {
    includePrefix?: boolean;
    encode?: boolean;
  }
): string {
  const { includePrefix = true, encode = true } = options || {};

  const queryParams: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined) {
          const encodedKey = encode ? encodeURIComponent(key) : key;
          const encodedValue = encode
            ? encodeURIComponent(String(item))
            : String(item);
          queryParams.push(`${encodedKey}=${encodedValue}`);
        }
      });
    } else if (typeof value === "object") {
      const encodedKey = encode ? encodeURIComponent(key) : key;
      const encodedValue = encode
        ? encodeURIComponent(JSON.stringify(value))
        : JSON.stringify(value);
      queryParams.push(`${encodedKey}=${encodedValue}`);
    } else {
      const encodedKey = encode ? encodeURIComponent(key) : key;
      const encodedValue = encode
        ? encodeURIComponent(String(value))
        : String(value);
      queryParams.push(`${encodedKey}=${encodedValue}`);
    }
  }

  const queryString = queryParams.join("&");
  return includePrefix && queryString ? `${queryString}` : queryString;
}