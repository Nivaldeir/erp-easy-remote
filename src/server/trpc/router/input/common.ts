import { z } from "zod";

export const workspaceIdInput = z.object({
  workspaceId: z.string().optional(),
});

export const paginationInput = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(10),
});

export const workspaceIdWithPaginationInput = workspaceIdInput.extend({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(10),
});

export const accountPayableGetAllInput = workspaceIdWithPaginationInput.extend({
  search: z.string().optional(),
  status: z.enum(["all", "PENDING", "PAID"]).optional(),
  sort: z.array(z.object({
    id: z.string(),
    desc: z.boolean(),
  })).optional(),
});

