import { prisma } from "@/src/shared/config/db";
import { TRPCError } from "@trpc/server";

export async function validateWorkspaceAccess(
  workspaceId: string | null | undefined,
  userId: string
): Promise<void> {
  if (!workspaceId || workspaceId === "all") {
    return;
  }

  const workspace = await prisma.workerSpace.findFirst({
    where: {
      id: workspaceId,
      users: {
        some: {
          id: userId,
        },
      },
    },
  });

  if (!workspace) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Você não tem acesso a este workspace",
    });
  }
}

export function getUserId(ctx: { session?: { user?: any } }): string {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Usuário não autenticado",
    });
  }

  const userId = ctx.session.user.id;
  
  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "ID do usuário não encontrado",
    });
  }

  return userId;
}

