import { NextResponse } from "next/server";
import { getPromptsDB, savePromptsDB } from "../../../../lib/db";
import { checkRateLimit, validateAndSanitizePrompt } from "../../../../lib/security";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const ip = request.headers.get("x-forwarded-for") || "client-ip";

    if (!checkRateLimit(ip, 30, 60000)) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const sanitizedData = validateAndSanitizePrompt(body);

    const prompts = getPromptsDB();
    const index = prompts.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Prompt not found" },
        { status: 404 }
      );
    }

    const updatedPrompt = {
      ...prompts[index],
      ...sanitizedData,
      updatedAt: Date.now()
    };

    prompts[index] = updatedPrompt;
    savePromptsDB(prompts);

    return NextResponse.json({ success: true, data: updatedPrompt });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update prompt" },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const ip = request.headers.get("x-forwarded-for") || "client-ip";

    if (!checkRateLimit(ip, 30, 60000)) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 }
      );
    }

    const prompts = getPromptsDB();
    const filtered = prompts.filter((p) => p.id !== id);

    if (filtered.length === prompts.length) {
      return NextResponse.json(
        { success: false, error: "Prompt not found" },
        { status: 404 }
      );
    }

    savePromptsDB(filtered);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete prompt" },
      { status: 500 }
    );
  }
}
