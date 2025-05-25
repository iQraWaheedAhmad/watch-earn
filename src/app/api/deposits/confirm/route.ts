import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthRequest } from "../../auth/middleware";

// This is a simplified version since we don't have actual file storage
// In a production app, you'd use a service like AWS S3, Cloudinary, etc.
async function confirmDeposit(request: AuthRequest) {
  try {
    // User is already authenticated via middleware
    const userId = request.user?.id;

    // In a real implementation, we'd use FormData to handle file uploads
    // Since we don't have actual file storage, we'll simulate it
    const data = await request.json();
    const { transactionHash, amount, currency, paymentProofUrl = "" } = data;

    // Validate input
    if (!transactionHash || !amount || !currency) {
      return NextResponse.json(
        { message: "Transaction hash, amount, and currency are required" },
        { status: 400 }
      );
    }

    // Prevent deposit if user already has a plan (only one deposit allowed)
    const existingPlan = await prisma.userPlanProgress.findFirst({
      where: { userId: Number(userId) },
    });
    if (existingPlan) {
      return NextResponse.json(
        {
          message:
            "You have already made a deposit. Only one deposit is allowed per user.",
        },
        { status: 400 }
      );
    }

    // Create deposit record
    const deposit = await prisma.deposit.create({
      data: {
        userId: Number(userId),
        amount: parseFloat(amount),
        currency,
        transactionHash,
        paymentProofUrl, // In a real app, this would be the URL to the uploaded file
        status: "pending",
      },
    });

    // Immediately upsert UserPlanProgress so user can start earning
    const planAmount = Math.floor(parseFloat(amount));
    await prisma.userPlanProgress.upsert({
      where: { userId_planAmount: { userId: Number(userId), planAmount } },
      update: {},
      create: {
        userId: Number(userId),
        planAmount,
      },
    });

    return NextResponse.json(
      {
        message: "Deposit confirmation submitted successfully",
        deposit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Deposit confirmation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with authentication middleware
export const POST = requireAuth(confirmDeposit);
