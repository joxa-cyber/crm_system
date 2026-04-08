export function formatUZS(amount: number | string | { toString(): string }): string {
  const num = typeof amount === "number" ? amount : Number(amount);
  return new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: 0,
  }).format(num) + " so'm";
}

export function formatUSD(amount: number | string | { toString(): string }): string {
  const num = typeof amount === "number" ? amount : Number(amount);
  return "$" + new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatCurrency(amount: number | string | { toString(): string }, currency: string): string {
  const num = typeof amount === "number" ? amount : Number(amount);
  switch (currency) {
    case "USD":
      return formatUSD(num);
    case "EUR":
      return "€" + new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    case "RUB":
      return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(num) + " ₽";
    default:
      return formatUZS(num);
  }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("uz-UZ", {
    month: "short",
    day: "numeric",
  });
}

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  MATERIALLAR: "Materiallar",
  ISHHAQI: "Ish haqi",
  TRANSPORT: "Transport",
  OVQAT: "Ovqat",
  ASBOB_USKUNALAR: "Asbob-uskunalar",
  BOSHQA: "Boshqa",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  YANGI: "Yangi",
  JARAYONDA: "Jarayonda",
  TUGALLANGAN: "Tugallangan",
  BEKOR: "Bekor qilingan",
};

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  YANGI: "bg-blue-100 text-blue-800",
  JARAYONDA: "bg-yellow-100 text-yellow-800",
  TUGALLANGAN: "bg-green-100 text-green-800",
  BEKOR: "bg-red-100 text-red-800",
};

export const CURRENCY_LABELS: Record<string, string> = {
  UZS: "UZS (so'm)",
  USD: "USD ($)",
  EUR: "EUR (€)",
  RUB: "RUB (₽)",
};
