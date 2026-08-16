import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body || {};

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid URL parameter" },
        { status: 400 }
      );
    }

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }

    // Fetch remote image with standard browser headers
    const res = await fetch(cleanUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      }
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch image from URL (HTTP ${res.status})` },
        { status: 400 }
      );
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json(
        { success: false, error: "Remote image URL returned empty content" },
        { status: 400 }
      );
    }

    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = contentType.startsWith("image/") ? contentType : "image/jpeg";
    const dataUrl = `data:${mime};base64,${base64}`;

    return NextResponse.json({
      success: true,
      dataUrl,
      sizeBytes: arrayBuffer.byteLength,
      contentType: mime
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to download image URL" },
      { status: 500 }
    );
  }
}
