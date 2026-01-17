import { getServerSession } from "next-auth";
import { authOptions } from "../config/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../config/db";

export const validateUserRequest = async (request: NextRequest) => {

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const workerSpace = await prisma.workerSpace.findFirst({
    where: {
      users: {
        some: {
          email: session.user.email!,
        },
      },
    },
  });

  if (!workerSpace) {
    return NextResponse.json(
      { error: "Workspace not found" },
      { status: 404 }
    );
  }

  return {
    ...session.user,
    workerSpaceId: workerSpace.id,
  };
};