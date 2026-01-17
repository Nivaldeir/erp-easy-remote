import { router } from "../trpc";
import { accountPayableRouter } from "./accountPayable";
import { contractRouter } from "./contract";
import { userRouter } from "./user";
import { equipamentsRouter } from "./equipaments";
import { workspaceRouter } from "./workspace";

export const appRouter = router({
  user: userRouter,
  contract: contractRouter,
  accountPayable: accountPayableRouter,
  equipament: equipamentsRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;