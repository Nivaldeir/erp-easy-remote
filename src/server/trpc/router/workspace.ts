import { prisma } from "@/src/shared/config/db";
import { protectedProcedure, router } from "../trpc";
import { workspaceCreateInput } from "./input/workspace";
import { getUserId } from "./helpers/workspace-validation";

export const workspaceRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = getUserId(ctx);

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

  create: protectedProcedure
    .input(workspaceCreateInput)
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);

      try {
        const workspace = await prisma.workerSpace.create({
          data: {
            name: input.name,
            description: input.description || null,
            users: {
              connect: {
                id: userId,
              },
            },
          },
        });

        return workspace;
      } catch (error) {
        console.error("Erro ao criar workspace:", error);
        throw new Error("Erro ao criar workspace");
      }
    }),
});

