import { z } from "zod";
import { StatusAccountsPayable } from "@prisma/client";

export const accountPayableCreateInput = z.object({
  id: z.string().optional(),
  nf: z.string().optional(),
  issuer: z.coerce.date().optional(),
  supplier: z.string().optional(),
  product_and_services: z.string().optional(),
  construction_cost: z.string().optional(),
  formPayment: z.string().optional(),
  valueAmount: z.number().positive("Valor deve ser positivo"),
  installments: z.number().int().positive().optional(),
  valueTotal: z.number().positive("Valor total deve ser positivo"),
  maturity: z.coerce.date(),
  launchDate: z.coerce.date(),
  paidDate: z.coerce.date().optional(),
  status: z.nativeEnum(StatusAccountsPayable).default(StatusAccountsPayable.PENDING),
  workerSpaceId: z.string().min(1, "WorkerSpaceId é obrigatório"),
});

