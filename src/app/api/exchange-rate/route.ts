import { getExchangeRate } from "@/lib/cbu";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const usdRate = await getExchangeRate("USD");
    const eurRate = await getExchangeRate("EUR");
    const rubRate = await getExchangeRate("RUB");

    return NextResponse.json({
      USD: usdRate,
      EUR: eurRate,
      RUB: rubRate,
      UZS: 1,
      date: new Date().toISOString().split("T")[0],
    });
  } catch {
    return NextResponse.json({ error: "Kurs topilmadi" }, { status: 500 });
  }
}
