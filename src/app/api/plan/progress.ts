import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TODO: Replace this with your actual authentication/session logic
async function getUserId(): Promise<number | null> {
  // Example: extract userId from session/cookie
  // return req.session?.userId || null;
  return 1; // <-- Replace with real user ID
}

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const planAmount = Number(searchParams.get("planAmount"));
  if (!planAmount) {
    return NextResponse.json(
      { error: "planAmount is required" },
      { status: 400 }
    );
  }

  const progress = await prisma.userPlanProgress.findUnique({
    where: { userId_planAmount: { userId, planAmount } },
  });

  if (!progress) {
    return NextResponse.json(
      { error: "No progress found for this plan" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, progress });
}
