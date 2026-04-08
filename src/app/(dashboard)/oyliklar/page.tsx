import { db } from "@/lib/db";
import { formatUZS, formatDate } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

function getDateRange(period: string) {
  const now = new Date();
  const start = new Date();

  if (period === "kunlik") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "oylik") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end: now };
}

async function getSalaryReport(period: string) {
  const { start, end } = getDateRange(period);

  const payments = await db.salaryPayment.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    orderBy: { date: "desc" },
    include: {
      worker: { select: { firstName: true, lastName: true, id: true, position: true } },
      paidBy: { select: { fullName: true } },
    },
  });

  // Group by worker
  const byWorker: Record<string, { name: string; position: string; total: number; id: string; count: number }> = {};
  let total = 0;

  for (const p of payments) {
    const amt = Number(p.amountUzs);
    total += amt;
    const key = p.workerId;
    if (!byWorker[key]) {
      byWorker[key] = {
        name: `${p.worker.firstName} ${p.worker.lastName}`,
        position: p.worker.position,
        total: 0,
        id: p.worker.id,
        count: 0,
      };
    }
    byWorker[key].total += amt;
    byWorker[key].count += 1;
  }

  return { payments, byWorker, total };
}

export default async function OyliklarPage() {
  const [kunlik, oylik, yillik] = await Promise.all([
    getSalaryReport("kunlik"),
    getSalaryReport("oylik"),
    getSalaryReport("yillik"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Oyliklar</h1>

      <Tabs defaultValue="kunlik" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kunlik">Kunlik</TabsTrigger>
          <TabsTrigger value="oylik">Oylik</TabsTrigger>
          <TabsTrigger value="yillik">Yillik</TabsTrigger>
        </TabsList>

        {[
          { key: "kunlik", data: kunlik, label: "Bugun" },
          { key: "oylik", data: oylik, label: "Shu oy" },
          { key: "yillik", data: yillik, label: "Shu yil" },
        ].map(({ key, data, label }) => (
          <TabsContent key={key} value={key} className="space-y-4">
            {/* Total */}
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-gray-500">{label} jami oylik to'lovlari</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatUZS(data.total)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {data.payments.length} ta to'lov
                </p>
              </CardContent>
            </Card>

            {/* By worker */}
            {Object.keys(data.byWorker).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Ishchi bo'yicha</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.values(data.byWorker)
                      .sort((a, b) => b.total - a.total)
                      .map((w) => (
                        <Link
                          key={w.id}
                          href={`/ishchilar/${w.id}`}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-blue-600">{w.name}</p>
                            <p className="text-xs text-gray-500">
                              {w.position} • {w.count} ta to'lov
                            </p>
                          </div>
                          <p className="text-sm font-bold text-orange-600">
                            {formatUZS(w.total)}
                          </p>
                        </Link>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment list */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">To'lovlar ro'yxati</CardTitle>
              </CardHeader>
              <CardContent>
                {data.payments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Bu davrda oylik to'lovlari yo'q
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <Link
                            href={`/ishchilar/${p.worker.id}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {p.worker.firstName} {p.worker.lastName}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {formatDate(p.date)} • {p.paidBy.fullName}
                            {p.note && <> • {p.note}</>}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-orange-600 flex-shrink-0 ml-3">
                          {formatUZS(p.amountUzs)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
