import { prisma } from "@/src/shared/config/db";
import { publicProcedure, router } from "../trpc";
import { equipamentGetAllInput } from "./input/equipament";

export const equipamentsRouter = router({

  getAll: publicProcedure.input(equipamentGetAllInput).query(async ({ input }) => {
    const where: any = {};
    
    if (input.workspaceId && input.workspaceId !== "all") {
      where.workerSpaceId = input.workspaceId;
    }

    if (input.search && input.search.trim() !== "") {
      where.OR = [
        { name: { contains: input.search, mode: "insensitive" } },
        { mark: { contains: input.search, mode: "insensitive" } },
        { model: { contains: input.search, mode: "insensitive" } },
      ];
    }

    const equipaments = await prisma.equipment.findMany({
      where,
      include: {
        contracts: {
          where: {
            status: "ACTIVE",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Filtrar por status baseado em contratos ativos
    let filteredEquipaments = equipaments;

    if (input.status && input.status !== "all") {
      filteredEquipaments = equipaments.filter((equipment) => {
        const hasActiveContract = equipment.contracts.length > 0;
        
        switch (input.status) {
          case "rented":
            return hasActiveContract;
          case "available":
            return !hasActiveContract;
          case "maintenance":
            // Verificar se há data de manutenção próxima ou passada
            if (equipment.nextMaintenance) {
              const nextMaintenance = new Date(equipment.nextMaintenance);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return nextMaintenance <= today || 
                     (equipment.lastMaintenance && new Date(equipment.lastMaintenance) > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));
            }
            return false;
          case "inactive":
            return false; // Não temos campo para inativo, pode ser adicionado depois
          default:
            return true;
        }
      });
    }

    // Retornar equipamentos com informações calculadas
    return filteredEquipaments.map((equipment) => ({
      ...equipment,
      hasActiveContract: equipment.contracts.length > 0,
      activeContractsCount: equipment.contracts.length,
    }));
  }),

});