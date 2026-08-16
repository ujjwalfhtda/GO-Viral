import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cwd = process.cwd();
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];

    // Target directories
    const rootDir = path.join(cwd, "login profile ");
    const publicTargetDir = path.join(cwd, "public", "login-profile");

    // Ensure target public directory exists
    if (!fs.existsSync(publicTargetDir)) {
      fs.mkdirSync(publicTargetDir, { recursive: true });
    }

    const activeRootFiles = new Set();

    // 1. Sync active images from root folder -> public target folder
    if (fs.existsSync(rootDir)) {
      const files = fs.readdirSync(rootDir);
      for (const file of files) {
        if (file.startsWith("._") || file.startsWith(".")) continue;
        const ext = path.extname(file).toLowerCase();
        if (validExtensions.includes(ext)) {
          activeRootFiles.add(file);
          const srcPath = path.join(rootDir, file);
          const destPath = path.join(publicTargetDir, file);
          try {
            fs.copyFileSync(srcPath, destPath);
          } catch (err) {
            console.error("Error syncing login profile image file:", file, err);
          }
        }
      }
    }

    // 2. Remove orphaned image files in public target directory if deleted from root directory
    if (fs.existsSync(publicTargetDir)) {
      const publicFiles = fs.readdirSync(publicTargetDir);
      for (const file of publicFiles) {
        if (file.startsWith("._") || file.startsWith(".")) continue;
        const ext = path.extname(file).toLowerCase();
        if (validExtensions.includes(ext)) {
          // If file was deleted from root folder (and root folder exists), remove it from public folder
          if (fs.existsSync(rootDir) && !activeRootFiles.has(file)) {
            const orphanPath = path.join(publicTargetDir, file);
            try {
              if (fs.existsSync(orphanPath)) {
                fs.unlinkSync(orphanPath);
              }
            } catch (err) {
              console.error("Error cleaning up deleted login profile image:", file, err);
            }
          }
        }
      }
    }

    // 3. Read active image files in public/login-profile
    const publicFiles = fs.existsSync(publicTargetDir) ? fs.readdirSync(publicTargetDir) : [];

    const imageFiles = publicFiles
      .filter((file) => {
        if (file.startsWith("._") || file.startsWith(".")) return false;
        const ext = path.extname(file).toLowerCase();
        return validExtensions.includes(ext);
      })
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

    // 4. Map to slide objects for frontend slideshow UI
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
