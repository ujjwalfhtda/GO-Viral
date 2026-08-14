import { NextResponse } from "next/server";
import { getStatsDB } from "../../../lib/db";

export async function GET(request) {
  try {
    const stats = getStatsDB();
    return NextResponse.json({
      status: "healthy",
      service: "PromptVerse API",
      version: "1.2.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      metrics: {
        totalPrompts: stats.totalPrompts,
        totalLikes: stats.totalLikes
      }
    });
  } catch (error) {
    return NextResponse.json(
      { status: "unhealthy", error: error.message },
      { status: 500 }
    );
  }
}
