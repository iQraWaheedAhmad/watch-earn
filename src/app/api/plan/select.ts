import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthRequest } from "@/app/api/auth/middleware";

export const POST = requireAuth(async (req: AuthRequest) => {
  const userId = req.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planAmount } = await req.json();
  if (!planAmount) {
    return NextResponse.json(
      { error: "planAmount is required" },
      { status: 400 }
    );
  }

  // Upsert UserPlanProgress
  const progress = await prisma.userPlanProgress.upsert({
    where: { userId_planAmount: { userId, planAmount } },
    update: {},
    create: {
      userId,
      planAmount,
    },
  });

  return NextResponse.json({ success: true, progress });
});
