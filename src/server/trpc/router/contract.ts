import { protectedProcedure, router } from "../trpc";
import { prisma } from "@/src/shared/config/db";
import { contractCreateInput } from "./input/contract";
import { randomId } from "@/src/shared/lib/random-id";
import { workspaceIdInput } from "./input/common";
import { z } from "zod";

export const contractRouter = router({
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const contract = await prisma.contracts.findUnique({
      where: { id: input.id },
    });
    return contract;
  }),
  getAll: protectedProcedure.input(workspaceIdInput).query(async ({ input }) => {
    const where: any = {};

    if (input.workspaceId && input.workspaceId !== "all") {
      where.workerSpaceId = input.workspaceId;
    }

    const contracts = await prisma.contracts.findMany({
      where,
    });
    return contracts;
  }),
  getSummary: protectedProcedure.input(workspaceIdInput).query(async ({ input }) => {
    const where: any = {};

    if (input.workspaceId && input.workspaceId !== "all") {
      where.workerSpaceId = input.workspaceId;
    }

    const [ativos, pendentes, finalizados, total] = await Promise.all([
      prisma.contracts.count({
        where: { ...where, status: "ACTIVE" },
      }),
      prisma.contracts.count({
        where: { ...where, status: "PENDING" },
      }),
      prisma.contracts.count({
        where: { ...where, status: "FINISHED" },
      }),
      prisma.contracts.count({ where }),
    ]);

    return {
      ativos,
      pendentes,
      finalizados,
      total,
    };
  }),
  createOrUpdate: protectedProcedure.input(contractCreateInput).mutation(async ({ input }) => {
    if (input.id) {
      return await prisma.contracts.update({
        where: { id: input.id },
        data: {
          ...input,
        },
      });
    }
    return await prisma.contracts.create({ data: { ...input, id: randomId("contrato") } });
  }),
});