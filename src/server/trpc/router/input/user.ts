import { z } from "zod";

export const userRegisterInput = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
});