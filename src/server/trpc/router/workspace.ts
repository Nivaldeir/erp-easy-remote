import { prisma } from "@/src/shared/config/db";
import { protectedProcedure, router } from "../trpc";

export const workspaceRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const userId = (ctx.session.user as any).id;
    
    if (!userId) {
      throw new Error("ID do usuário não encontrado");
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          workerSpaces: {
            orderBy: {
              name: "asc",
            },
          },
        },
      });

      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      const workspaces = user.workerSpaces || [];

      if (workspaces.length === 0) {
        const allWorkspaces = await prisma.workerSpace.findMany({
          where: {
            users: {
              some: {
                id: userId,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        });
        return allWorkspaces;
      }

      return workspaces;
    } catch (error) {
      console.error("Erro ao buscar workspaces:", error);
      throw error;
    }
  }),
});

