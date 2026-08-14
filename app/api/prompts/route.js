import { NextResponse } from "next/server";
import { getPromptsDB, savePromptsDB } from "../../../lib/db";
import { checkRateLimit, validateAndSanitizePrompt } from "../../../lib/security";

export async function GET(request) {
  try {
    const prompts = getPromptsDB();
    return NextResponse.json({ success: true, data: prompts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client-ip";
    
    if (!checkRateLimit(ip, 30, 60000)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const sanitizedData = validateAndSanitizePrompt(body);

    const prompts = getPromptsDB();
    const newPrompt = {
      id: "p_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      ...sanitizedData,
      likes: 1,
      createdAt: Date.now(),
      isUserCreated: true
    };

    const updatedPrompts = [newPrompt, ...prompts];
    savePromptsDB(updatedPrompts);

    return NextResponse.json({ success: true, data: newPrompt }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Invalid payload" },
      { status: 400 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { action, id, increment, likes, promptData, prompts } = body;

    if (Array.isArray(prompts)) {
      savePromptsDB(prompts);
      return NextResponse.json({ success: true, data: prompts });
    }

    if (action === "like") {
      const updated = likePromptDB(id, increment !== false);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "set_likes") {
      const allPrompts = getPromptsDB();
      const idx = allPrompts.findIndex((p) => p.id === id);
      if (idx !== -1) {
        allPrompts[idx].likes = Math.max(0, parseInt(likes, 10) || 0);
        savePromptsDB(allPrompts);
        return NextResponse.json({ success: true, data: allPrompts[idx] });
      }
    }

    if (action === "update") {
      const allPrompts = getPromptsDB();
      const idx = allPrompts.findIndex((p) => p.id === promptData.id);
      if (idx !== -1) {
        allPrompts[idx] = { ...allPrompts[idx], ...promptData, updatedAt: Date.now() };
        savePromptsDB(allPrompts);
        return NextResponse.json({ success: true, data: allPrompts[idx] });
      }
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
