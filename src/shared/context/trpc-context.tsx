"use client";

import { AppRouter } from "@/src/server/trpc/router/main";
import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, loggerLink, unstable_httpBatchStreamLink, TRPCLink, TRPCClientError } from "@trpc/client";
import SuperJSON from "superjson";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { observable } from "@trpc/server/observable";
import { useState } from "react";
import { signOut } from "next-auth/react";

export const api = createTRPCReact<AppRouter>();

const errorHandlingLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    const observableResult = next(op);
    return observable((observer) => {
      let isObserverActive = true;

      const subscription = observableResult.subscribe({
        next(value) {
          if (!isObserverActive) return;
          try {
            observer.next(value);
          } catch (error) {
            isObserverActive = false;
          }
        },
        error(err: TRPCClientError<AppRouter>) {
          try {
            if (!isObserverActive) return;
            
            // Não faz logout para erros de validação 2FA (são erros de negócio, não de autenticação)
            const is2FAValidationError = 
              op.path === "user.validate2FA" ||
              op.path === "user.enable2FA" ||
              err.message?.toLowerCase().includes("código inválido") ||
              err.message?.toLowerCase().includes("código incorreto") ||
              err.message?.toLowerCase().includes("invalid code") ||
              err.message?.toLowerCase().includes("incorrect code");
            
            if (
              !is2FAValidationError &&
              (
                err.data?.code === "UNAUTHORIZED" ||
                err.message === "TOKEN_INVALIDO" ||
                err.message?.toLowerCase().includes("token inválido") ||
                err.message?.toLowerCase().includes("token expirado")
              )
            ) {
              // clearAllAuthDataAndRedirect();
              return;
            }
            
            observer.error(err);
          } catch (error) {
            isObserverActive = false;
          }
        },
        complete() {
          if (!isObserverActive) return;
          try {
            observer.complete();
          } catch (error) {
            isObserverActive = false;
          }
        },
      });

      return () => {
        isObserverActive = false;
        subscription.unsubscribe();
      };
    });
  };
};

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: () => process.env.NODE_ENV === "development",
        }),
        errorHandlingLink,
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: `${getBaseUrl()}/api/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
              signal: AbortSignal.timeout(30000),
            });
          },
          headers() {
            const h = new Headers();
            h.set("x-trpc-source", "nextjs-react");
            return h;
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function clearAllAuthDataAndRedirect() {
  localStorage.clear();
  sessionStorage.clear();
  signOut({ callbackUrl: "/auth" });
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
