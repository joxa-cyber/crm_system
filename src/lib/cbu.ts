import { db } from "@/lib/db";

interface CBURate {
  Ccy: string;
  Rate: string;
  Nominal: string;
  Date: string;
}

export async function fetchAndCacheRates(): Promise<void> {
  const response = await fetch(
    "https://cbu.uz/uz/arkhiv-kursov-valyut/json/",
    { cache: "no-store" }
  );
  const data: CBURate[] = await response.json();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const relevantCurrencies = ["USD", "EUR", "RUB"];

  for (const item of data) {
    if (relevantCurrencies.includes(item.Ccy)) {
      const rate = parseFloat(item.Rate) / parseInt(item.Nominal);
      await db.exchangeRate.upsert({
        where: {
          currency_date: { currency: item.Ccy, date: today },
        },
        update: { rate },
        create: {
          currency: item.Ccy,
          rate,
          date: today,
        },
      });
    }
  }
}

export async function getExchangeRate(currency: string): Promise<number> {
  if (currency === "UZS") return 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let rate = await db.exchangeRate.findUnique({
    where: {
      currency_date: { currency, date: today },
    },
  });

  if (!rate) {
    await fetchAndCacheRates();
    rate = await db.exchangeRate.findUnique({
      where: {
        currency_date: { currency, date: today },
      },
    });
  }

  if (!rate) {
    // Fallback: get the most recent rate
    const latest = await db.exchangeRate.findFirst({
      where: { currency },
      orderBy: { date: "desc" },
    });
    if (latest) return Number(latest.rate);
    throw new Error(`Valyuta kursi topilmadi: ${currency}`);
  }

  return Number(rate.rate);
}

export async function convertToUzs(
  amount: number,
  currency: string
): Promise<number> {
  const rate = await getExchangeRate(currency);
  return Math.round(amount * rate * 100) / 100;
}
