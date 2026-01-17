import { z } from "zod";
import { StatusContracts } from "@prisma/client";

export const contractCreateInput = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  clientName: z.string().optional(),
  status: z.nativeEnum(StatusContracts).default(StatusContracts.PENDING),
  workId: z.string().optional(),
  equipmentId: z.string().optional(),
  initDate: z.date().optional(),
  endDate: z.date().optional(),
  valueDaily: z.number().positive().optional(),
  amountDays: z.number().int().positive().optional(),
  amountTotal: z.number().positive().optional(),
  workerSpaceId: z.string().min(1, "WorkerSpaceId é obrigatório"),
});

