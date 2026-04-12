import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatCurrency, formatUZS } from "@/lib/formatters";
import { getExchangeRate } from "@/lib/cbu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EstimateItemForm } from "@/components/estimates/estimate-item-form";
import { EstimateItemRow } from "@/components/estimates/estimate-item-row";
import { EstimatePaymentForm } from "@/components/estimates/estimate-payment-form";
import {
  EstimateStatusSelect,
  DuplicateEstimateButton,
  DeleteEstimateButton,
} from "@/components/estimates/estimate-actions";
import { DeletePaymentButton } from "@/components/estimates/delete-payment-button";
import { DownloadPdfButton } from "@/components/estimates/download-pdf-button";

const STATUS_COLORS: Record<string, string> = {
  QORALAMA: "bg-gray-100 text-gray-800",
  YUBORILGAN: "bg-blue-100 text-blue-800",
  TASDIQLANGAN: "bg-green-100 text-green-800",
  BEKOR: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  QORALAMA: "Qoralama",
  YUBORILGAN: "Yuborilgan",
  TASDIQLANGAN: "Tasdiqlangan",
  BEKOR: "Bekor",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SmetaTafsilotPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const estimate = await db.estimate.findUnique({
    where: { id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { date: "desc" } },
      createdBy: { select: { fullName: true } },
      project: { select: { name: true, id: true } },
    },
  });

  if (!estimate) notFound();

  // Hisoblash - valyuta bo'yicha jami
  const totalByCurrency: Record<string, number> = {};
  for (const item of estimate.items) {
    totalByCurrency[item.currency] = (totalByCurrency[item.currency] || 0) + Number(item.totalAmount);
  }

  // To'lovlar
  const paidByCurrency: Record<string, number> = {};
  for (const p of estimate.payments) {
    paidByCurrency[p.currency] = (paidByCurrency[p.currency] || 0) + Number(p.amount);
  }

  // Qarz
  const debtByCurrency: Record<string, number> = {};
  for (const cur of new Set([...Object.keys(totalByCurrency), ...Object.keys(paidByCurrency)])) {
    const total = totalByCurrency[cur] || 0;
    const paid = paidByCurrency[cur] || 0;
    const debt = total - paid;
    if (Math.abs(debt) > 0.01) {
      debtByCurrency[cur] = debt;
    }
  }

  // Bugungi kurs bo'yicha jami
  const currencies = Object.keys(totalByCurrency);
  const hasMultipleCurrencies = currencies.length > 1 || (currencies.length === 1 && currencies[0] !== "UZS");
  let combinedTotalUzs = 0;
  let combinedTotalUsd = 0;
  let usdRate = 0;
  const rateInfo: Record<string, number> = {};
  if (hasMultipleCurrencies) {
    // Avval USD kursini olish
    try {
      usdRate = await getExchangeRate("USD");
    } catch {
      usdRate = 0;
    }

    for (const cur of currencies) {
      if (cur === "UZS") {
        rateInfo[cur] = 1;
        combinedTotalUzs += totalByCurrency[cur];
        if (usdRate > 0) {
          combinedTotalUsd += totalByCurrency[cur] / usdRate;
        }
      } else if (cur === "USD") {
        rateInfo[cur] = usdRate;
        combinedTotalUzs += totalByCurrency[cur] * usdRate;
        combinedTotalUsd += totalByCurrency[cur];
      } else {
        try {
          const rate = await getExchangeRate(cur);
          rateInfo[cur] = rate;
          combinedTotalUzs += totalByCurrency[cur] * rate;
          if (usdRate > 0) {
            combinedTotalUsd += (totalByCurrency[cur] * rate) / usdRate;
          }
        } catch {
          rateInfo[cur] = 0;
        }
      }
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{estimate.name}</h1>
            <Badge className={STATUS_COLORS[estimate.status]} variant="secondary">
              {STATUS_LABELS[estimate.status]}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            {estimate.clientName}
            {estimate.project && <> • Loyiha: {estimate.project.name}</>}
            {" "}• {estimate.createdBy.fullName}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap print:hidden">
          <EstimateStatusSelect estimateId={estimate.id} currentStatus={estimate.status} />
          <DownloadPdfButton
            estimateName={estimate.name}
            clientName={estimate.clientName}
            clientPhone={estimate.clientPhone}
            clientAddress={estimate.clientAddress}
            projectName={estimate.project?.name || null}
            createdByName={estimate.createdBy.fullName}
            createdAt={estimate.createdAt.toISOString()}
            items={estimate.items.map((item) => ({
              name: item.name,
              quantity: String(item.quantity),
              unit: item.unit,
              unitPrice: String(item.unitPrice),
              currency: item.currency,
              wattPerUnit: item.wattPerUnit ? String(item.wattPerUnit) : null,
              pricePerWatt: item.pricePerWatt ? String(item.pricePerWatt) : null,
              totalAmount: String(item.totalAmount),
            }))}
            payments={estimate.payments.map((p) => ({
              date: p.date.toISOString(),
              amount: String(p.amount),
              currency: p.currency,
              note: p.note,
            }))}
            totalByCurrency={totalByCurrency}
            paidByCurrency={paidByCurrency}
            debtByCurrency={debtByCurrency}
          />
          <DuplicateEstimateButton estimateId={estimate.id} />
          {session.user.role === "ADMIN" && (
            <DeleteEstimateButton estimateId={estimate.id} />
          )}
        </div>
      </div>

      {/* Mijoz ma'lumotlari */}
      {(estimate.clientPhone || estimate.clientAddress) && (
        <Card className="print:shadow-none print:border-0">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Mijoz</p>
                <p className="font-medium">{estimate.clientName}</p>
              </div>
              {estimate.clientPhone && (
                <div>
                  <p className="text-gray-500">Telefon</p>
                  <p className="font-medium">{estimate.clientPhone}</p>
                </div>
              )}
              {estimate.clientAddress && (
                <div>
                  <p className="text-gray-500">Manzil</p>
                  <p className="font-medium">{estimate.clientAddress}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smeta qatorlari */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader>
          <CardTitle className="text-lg">Smeta</CardTitle>
        </CardHeader>
        <CardContent>
          {estimate.items.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Hali qatorlar yo'q</p>
          ) : (
            <div className="mb-4">
              {estimate.items.map((item, i) => (
                <EstimateItemRow
                  key={item.id}
                  index={i}
                  item={{
                    id: item.id,
                    name: item.name,
                    quantity: String(item.quantity),
                    unit: item.unit,
                    unitPrice: String(item.unitPrice),
                    currency: item.currency,
                    wattPerUnit: item.wattPerUnit ? String(item.wattPerUnit) : null,
                    pricePerWatt: item.pricePerWatt ? String(item.pricePerWatt) : null,
                    totalAmount: String(item.totalAmount),
                  }}
                />
              ))}

              {/* Jami */}
              <div className="border-t-2 border-gray-900 pt-3 mt-3">
                {Object.entries(totalByCurrency).map(([cur, val]) => (
                  <div key={cur} className="flex justify-between text-base">
                    <span className="font-bold">Jami ({cur}):</span>
                    <span className="font-bold text-lg">{formatCurrency(val, cur)}</span>
                  </div>
                ))}

                {/* Bugungi kurs bo'yicha jami */}
                {hasMultipleCurrencies && combinedTotalUzs > 0 && (
                  <div className="border-t border-gray-300 pt-3 mt-3 space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Bugungi kurs bo'yicha:</p>
                    {Object.entries(totalByCurrency).map(([cur, val]) => {
                      if (cur === "UZS") return (
                        <div key={cur} className="flex justify-between text-xs text-gray-500">
                          <span>{formatUZS(val)}</span>
                        </div>
                      );
                      const rate = rateInfo[cur] || 0;
                      return (
                        <div key={cur} className="flex justify-between text-xs text-gray-500">
                          <span>{formatCurrency(val, cur)} × {rate.toLocaleString("uz-UZ")} =</span>
                          <span>{formatUZS(val * rate)}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                      <span className="font-bold">Jami (USD):</span>
                      <span className="font-bold text-lg text-green-700">{formatCurrency(combinedTotalUsd, "USD")}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="font-bold">Jami (UZS):</span>
                      <span className="font-bold text-lg text-blue-700">{formatUZS(combinedTotalUzs)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="print:hidden">
            <EstimateItemForm estimateId={estimate.id} />
          </div>
        </CardContent>
      </Card>

      {/* To'lovlar va qarz */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader>
          <CardTitle className="text-lg">To'lovlar</CardTitle>
        </CardHeader>
        <CardContent>
          {estimate.payments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-2 mb-3">Hali to'lovlar yo'q</p>
          ) : (
            <div className="mb-4 space-y-2">
              {estimate.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 group">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(p.date).toLocaleDateString("uz-UZ")}
                      {p.note && <span className="text-gray-400 ml-2">— {p.note}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-green-600">
                      +{formatCurrency(p.amount, p.currency)}
                    </p>
                    <div className="print:hidden">
                      <DeletePaymentButton paymentId={p.id} />
                    </div>
                  </div>
                </div>
              ))}

              {/* To'langan jami */}
              <div className="border-t pt-2">
                {Object.entries(paidByCurrency).map(([cur, val]) => (
                  <div key={cur} className="flex justify-between text-sm">
                    <span className="text-gray-500">To'langan ({cur}):</span>
                    <span className="font-bold text-green-600">{formatCurrency(val, cur)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qarz */}
          {Object.keys(debtByCurrency).length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold text-orange-800 mb-1">Qarz qoldi:</p>
              {Object.entries(debtByCurrency).map(([cur, val]) => (
                <p key={cur} className={`text-lg font-bold ${val > 0 ? "text-orange-600" : "text-green-600"}`}>
                  {val > 0 ? formatCurrency(val, cur) : `To'langan ✓`}
                </p>
              ))}
            </div>
          )}

          {Object.keys(debtByCurrency).length === 0 && estimate.payments.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-lg font-bold text-green-600">To'liq to'langan ✓</p>
            </div>
          )}

          <div className="print:hidden">
            <EstimatePaymentForm estimateId={estimate.id} />
          </div>
        </CardContent>
      </Card>

      {/* Izoh */}
      {estimate.notes && (
        <Card className="print:shadow-none print:border-0">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-gray-500">Izoh</p>
            <p className="text-sm">{estimate.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
