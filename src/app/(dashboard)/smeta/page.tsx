import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  QORALAMA: "Qoralama",
  YUBORILGAN: "Yuborilgan",
  TASDIQLANGAN: "Tasdiqlangan",
  BEKOR: "Bekor",
};

const STATUS_COLORS: Record<string, string> = {
  QORALAMA: "bg-gray-100 text-gray-800",
  YUBORILGAN: "bg-blue-100 text-blue-800",
  TASDIQLANGAN: "bg-green-100 text-green-800",
  BEKOR: "bg-red-100 text-red-800",
};

export default async function SmetaPage() {
  const session = await auth();
  if (!session?.user) return null;

  const estimates = await db.estimate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { totalAmount: true, currency: true } },
      payments: { select: { amount: true, currency: true } },
      createdBy: { select: { fullName: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Smetalar</h1>
        <Link href="/smeta/yangi">
          <Button>+ Yangi smeta</Button>
        </Link>
      </div>

      {estimates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Hali smetalar yo'q</p>
            <Link href="/smeta/yangi">
              <Button>Birinchi smetani yarating</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {estimates.map((est) => {
            // Jami valyuta bo'yicha
            const totalByCurrency: Record<string, number> = {};
            for (const item of est.items) {
              totalByCurrency[item.currency] = (totalByCurrency[item.currency] || 0) + Number(item.totalAmount);
            }
            const paidByCurrency: Record<string, number> = {};
            for (const p of est.payments) {
              paidByCurrency[p.currency] = (paidByCurrency[p.currency] || 0) + Number(p.amount);
            }

            return (
              <Link key={est.id} href={`/smeta/${est.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{est.name}</h3>
                          <Badge className={STATUS_COLORS[est.status]} variant="secondary">
                            {STATUS_LABELS[est.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {est.clientName} • {est.createdBy.fullName} • {est.items.length} qator
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(est.createdAt).toLocaleDateString("uz-UZ")}
                        </p>
                      </div>
                      <div className="text-right">
                        {Object.entries(totalByCurrency).map(([cur, val]) => (
                          <p key={cur} className="text-sm font-bold">{formatCurrency(val, cur)}</p>
                        ))}
                        {Object.keys(paidByCurrency).length > 0 && (
                          <div className="mt-1">
                            {Object.entries(paidByCurrency).map(([cur, val]) => (
                              <p key={cur} className="text-xs text-green-600">To'langan: {formatCurrency(val, cur)}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
