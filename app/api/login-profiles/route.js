import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cwd = process.cwd();

    // Check target directories
    const rootDir = path.join(/*turbopackIgnore: true*/ cwd, "login profile ");
    const publicTargetDir = path.join(/*turbopackIgnore: true*/ cwd, "public", "login-profile");

    // Ensure target public directory exists
    if (!fs.existsSync(publicTargetDir)) {
      fs.mkdirSync(publicTargetDir, { recursive: true });
    }

    // Automatically sync any newly added images from root folder to public folder
    if (fs.existsSync(rootDir)) {
      const files = fs.readdirSync(rootDir);
      for (const file of files) {
        if (file.startsWith("._") || file.startsWith(".")) continue;
        const ext = path.extname(file).toLowerCase();
        if ([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"].includes(ext)) {
          const srcPath = path.join(/*turbopackIgnore: true*/ rootDir, file);
          const destPath = path.join(/*turbopackIgnore: true*/ publicTargetDir, file);
          try {
            if (!fs.existsSync(destPath)) {
              fs.copyFileSync(srcPath, destPath);
            }
          } catch (err) {
            console.error("Error syncing login profile image file:", file, err);
          }
        }
      }
    }

    // Read all valid image files in public/login-profile
    const publicFiles = fs.readdirSync(publicTargetDir);
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];

    const imageFiles = publicFiles
      .filter((file) => {
        if (file.startsWith("._") || file.startsWith(".")) return false;
        const ext = path.extname(file).toLowerCase();
        return validExtensions.includes(ext);
      })
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

    // Map to slide objects
    const images = imageFiles.map((filename, index) => {
      let title = "Selected Works";
      if (index === 1) title = "Featured Works";
      if (index === 2) title = "Creative Prompt";
      if (index === 3) title = "Visual Showcase";
      if (index === 4) title = "AI Studio Art";
      if (index > 4) title = `Prompt Work #${index + 1}`;

      return {
        id: filename,
        src: `/login-profile/${encodeURIComponent(filename)}`,
        title,
        creator: "Ujjwal Prompt",
        role: "UI & Prompt Studio"
      };
    });

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("Failed to load dynamic login profile images:", error);
    return NextResponse.json(
      { success: false, error: "Failed to scan login profile folder" },
      { status: 500 }
    );
  }
}
