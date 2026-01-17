import { z } from "zod";
import { workspaceIdInput } from "./common";

export const equipamentGetAllInput = workspaceIdInput.extend({
  search: z.string().optional(),
  status: z.enum(["all", "available", "rented", "maintenance", "inactive"]).optional(),
});

