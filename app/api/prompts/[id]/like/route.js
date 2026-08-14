import { NextResponse } from "next/server";
import { likePromptDB } from "../../../../../lib/db";
import { checkRateLimit } from "../../../../../lib/security";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const ip = request.headers.get("x-forwarded-for") || "client-ip";

    if (!checkRateLimit(ip, 60, 60000)) {
      return NextResponse.json(
        { success: false, error: "Too many request attempts" },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action === "unlike" ? false : true;

    const updated = likePromptDB(id, action);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Prompt not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, likes: updated.likes, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update like status" },
      { status: 500 }
    );
  }
}
