import { fetchAndCacheRates } from "@/lib/cbu";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await fetchAndCacheRates();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
  }
}
