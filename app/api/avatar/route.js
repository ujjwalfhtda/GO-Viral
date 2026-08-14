import { NextResponse } from "next/server";
import { getAvatarDB, saveAvatarDB } from "../../../lib/db";
import { checkRateLimit, isValidImageUrl } from "../../../lib/security";

export async function GET(request) {
  try {
    const avatar = getAvatarDB();
    return NextResponse.json({ success: true, avatar });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch avatar" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client-ip";

    if (!checkRateLimit(ip, 20, 60000)) {
      return NextResponse.json(
        { success: false, error: "Too many request attempts" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const avatarData = (body.avatar || "").trim();

    if (avatarData && !isValidImageUrl(avatarData)) {
      return NextResponse.json(
        { success: false, error: "Invalid avatar format" },
        { status: 400 }
      );
    }

    if (avatarData.length > 2500000) {
      return NextResponse.json(
        { success: false, error: "Avatar payload image size too large" },
        { status: 400 }
      );
    }

    saveAvatarDB(avatarData);
    return NextResponse.json({ success: true, avatar: avatarData });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save avatar" },
      { status: 500 }
    );
  }
}
