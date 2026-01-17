import { prisma } from "@/src/shared/config/db";
import { protectedProcedure, router } from "../trpc";
import { accountPayableCreateInput } from "./input/account-payable";
import { randomId } from "@/src/shared/lib/random-id";
import { workspaceIdInput, accountPayableGetAllInput } from "./input/common";
import { z } from "zod";
import { validateWorkspaceAccess, getUserId } from "./helpers/workspace-validation";

export const accountPayableRouter = router({
  
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const userId = getUserId(ctx);
    const accountPayable = await prisma.accountsPayable.findUnique({
      where: { id: input.id },
      include: {
        workerSpace: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!accountPayable) {
      return null;
    }

    const hasAccess = accountPayable.workerSpace.users.some((user) => user.id === userId);
    if (!hasAccess) {
      throw new Error("Você não tem acesso a esta conta a pagar");
    }

    return accountPayable;
  }),

  getAll: protectedProcedure.input(accountPayableGetAllInput).query(async ({ ctx, input }) => {
    const userId = getUserId(ctx);
    await validateWorkspaceAccess(input.workspaceId, userId);
    const where: any = {};
    
    if (input.workspaceId && input.workspaceId !== "all") {
      where.workerSpaceId = input.workspaceId;
    }

    if (input.search && input.search.trim() !== "") {
      where.OR = [
        { supplier: { contains: input.search, mode: "insensitive" } },
        { nf: { contains: input.search, mode: "insensitive" } },
        { product_and_services: { contains: input.search, mode: "insensitive" } },
      ];
    }

    if (input.status && input.status !== "all") {
      where.status = input.status;
    }

    // Construir orderBy baseado no sorting
    let orderBy: any = { maturity: "desc" }; // Default
    
    if (input.sort && input.sort.length > 0) {
      // Mapear campos do frontend para campos do Prisma
      const fieldMapping: Record<string, string> = {
        valueTotal: "valueTotal",
        valueAmount: "valueAmount",
        maturity: "maturity",
        launchDate: "launchDate",
        issueDate: "launchDate", // issueDate é o id da coluna, mas o campo no Prisma é launchDate
        paidDate: "paidDate",
        nf: "nf",
        supplier: "supplier",
        product_and_services: "product_and_services",
        status: "status",
      };

      // Se houver apenas um campo, usar objeto simples
      if (input.sort.length === 1) {
        const sortItem = input.sort[0];
        const prismaField = fieldMapping[sortItem.id] || sortItem.id;
        orderBy = {
          [prismaField]: sortItem.desc ? "desc" : "asc",
        };
      } else {
        // Múltiplos campos, usar array
        orderBy = input.sort.map((sortItem) => {
          const prismaField = fieldMapping[sortItem.id] || sortItem.id;
          return {
            [prismaField]: sortItem.desc ? "desc" : "asc",
          };
        });
      }
    }

    const [accountPayables, total] = await Promise.all([
      prisma.accountsPayable.findMany({
        where,
        orderBy,
        skip: (input.page - 1) * input.perPage,
        take: input.perPage,
      }),
      prisma.accountsPayable.count({ where }),
    ]);

    return {
      data: accountPayables,
      total,
      page: input.page,
      perPage: input.perPage,
      pageCount: Math.ceil(total / input.perPage),
    };
  }),
  getSummary: protectedProcedure.input(workspaceIdInput).query(async ({ ctx, input }) => {
    const userId = getUserId(ctx);
    await validateWorkspaceAccess(input.workspaceId, userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseWhere: any = {};
    if (input.workspaceId && input.workspaceId !== "all") {
      baseWhere.workerSpaceId = input.workspaceId;
    }

    const [pagarHoje, emAberto, atrasado, pagoMes] = await Promise.all([
      prisma.accountsPayable.count({
        where: {
          ...baseWhere,
          maturity: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
          status: "PENDING",
        },
      }),
      prisma.accountsPayable.count({
        where: {
          ...baseWhere,
          status: "PENDING",
        },
      }),
      prisma.accountsPayable.count({
        where: {
          ...baseWhere,
          maturity: {
            lt: today,
          },
          status: "PENDING",
        },
      }),
      prisma.accountsPayable.count({
        where: {
          ...baseWhere,
          status: "PAID",
          paidDate: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
        },
      }),
    ]);

    const [totalPagarHoje, totalEmAberto, totalAtrasado, totalPagoMes] = await Promise.all([
      prisma.accountsPayable.aggregate({
        where: {
          ...baseWhere,
          maturity: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
          status: "PENDING",
        },
        _sum: {
          valueAmount: true,
        },
      }),
      prisma.accountsPayable.aggregate({
        where: {
          ...baseWhere,
          status: "PENDING",
        },
        _sum: {
          valueAmount: true,
        },
      }),
      prisma.accountsPayable.aggregate({
        where: {
          ...baseWhere,
          maturity: {
            lt: today,
          },
          status: "PENDING",
        },
        _sum: {
          valueAmount: true,
        },
      }),
      prisma.accountsPayable.aggregate({
        where: {
          ...baseWhere,
          status: "PAID",
          paidDate: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
        },
        _sum: {
          valueAmount: true,
        },
      }),
    ]);

    return {
      pagarHoje: {
        count: pagarHoje,
        total: totalPagarHoje._sum.valueAmount || 0,
      },
      emAberto: {
        count: emAberto,
        total: totalEmAberto._sum.valueAmount || 0,
      },
      atrasado: {
        count: atrasado,
        total: totalAtrasado._sum.valueAmount || 0,
      },
      pagoMes: {
        count: pagoMes,
        total: totalPagoMes._sum.valueAmount || 0,
      },
    };
  }),
  createOrUpdate: protectedProcedure.input(accountPayableCreateInput).mutation(async ({ ctx, input }) => {
    const userId = getUserId(ctx);
    await validateWorkspaceAccess(input.workerSpaceId, userId);
    
    const data: any = {
      nf: input.nf || undefined,
      issuer: input.issuer,
      supplier: input.supplier,
      product_and_services: input.product_and_services,
      construction_cost: input.construction_cost,
      formPayment: input.formPayment,
      valueAmount: input.valueAmount,
      installments: input.installments || null,
      valueTotal: input.valueTotal,
      maturity: input.maturity,
      launchDate: input.launchDate,
      status: input.status,
      workerSpaceId: input.workerSpaceId,
    };

    if (input.paidDate) {
      data.paidDate = input.paidDate;
    }
    const accountPayable = await prisma.accountsPayable.upsert({
      where: { id: input.id || randomId("nf") },
      update: data,
      create: data,
    });

    return accountPayable;
  }),
}); 