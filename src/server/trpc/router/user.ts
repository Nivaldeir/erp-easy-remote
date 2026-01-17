import * as bcryptjs from "bcryptjs";
import { prisma } from "@/src/shared/lib/prisma";
import { publicProcedure, router } from "../trpc";
import { userRegisterInput } from "./input/user";

export const userRouter = router({
  register: publicProcedure.input(userRegisterInput).mutation(async ({ ctx, input }) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error("Email já está em uso");
    }

    const hashedPassword = await bcryptjs.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }),
});