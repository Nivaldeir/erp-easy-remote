import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import superjson from "superjson";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router;
export const publicProcedure = t.procedure.use(({ next, ctx }) => {
  return next({
    ctx: {
      ...ctx
    },
  });
});

const isAuthenticated = t.middleware(({ ctx, next, path }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Token de autenticação não fornecido" });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

const interceptMiddleware = t.middleware(async ({ next, path, type }) => {
  const result = await next();

  if (!result.ok && result.error) {
    const errorMessage = result.error.message?.toLowerCase() || "";

    // Não intercepta erros de validação 2FA (são erros de negócio, não de autenticação)
    const is2FAValidationError =
      path === "user.validate2FA" ||
      path === "user.enable2FA" ||
      errorMessage.includes("código inválido") ||
      errorMessage.includes("código incorreto") ||
      errorMessage.includes("invalid code") ||
      errorMessage.includes("incorrect code");

    // Só intercepta erros de token inválido/expirado se não for erro de validação 2FA
    if (
      !is2FAValidationError &&
      (
        errorMessage.includes("token inválido") ||
        errorMessage.includes("token expirado") ||
        errorMessage.includes("invalid token") ||
        errorMessage.includes("expired token") ||
        result.error.code === "UNAUTHORIZED"
      )
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "TOKEN_INVALIDO",
        cause: result.error,
      });
    }
  }

  return result;
});
export const protectedProcedure = t.procedure.use(isAuthenticated).use(interceptMiddleware);