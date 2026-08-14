import { NextResponse } from "next/server";
import { getStatsDB } from "../../../lib/db";

export async function GET(request) {
  try {
    const stats = getStatsDB();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to load platform stats" },
      { status: 500 }
    );
  }
}
