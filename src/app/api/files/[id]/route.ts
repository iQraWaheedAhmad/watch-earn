import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`[File Request] Attempting to fetch file with ID: ${id}`);

    const fileData = await prisma.fileUpload.findUnique({
      where: {
        id,
      },
    });

    if (!fileData) {
      console.warn(
        `[File Not Found] File with ID ${id} was not found in the database`
      );
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Support both old (data URL) and new (raw base64) formats
    let base64 = fileData.fileData;
    if (base64.startsWith("data:")) {
      base64 = base64.split(",")[1];
    }
    const buffer = Buffer.from(base64, "base64");

    console.log(
      `[File Served] Successfully served file: ${id}, type: ${fileData.fileType}`
    );

    return new Response(buffer, {
      headers: {
        "Content-Type": fileData.fileType,
        "Cache-Control": "public, max-age=31536000",
        "Content-Disposition": `inline; filename="${fileData.fileName}"`,
      },
    });
  } catch (error) {
    console.error("[File Service Error]", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
