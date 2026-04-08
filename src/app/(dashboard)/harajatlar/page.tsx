import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatUZS, formatDate, EXPENSE_CATEGORY_LABELS } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

async function getExpenseReport(period: string) {
  const { start, end } = getDateRange(period);

  const expenses = await db.expense.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    orderBy: { date: "desc" },
    include: {
      project: { select: { name: true, id: true } },
      addedBy: { select: { fullName: true } },
    },
  });

  // Group by category
  const byCategory: Record<string, number> = {};
  // Group by project
  const byProject: Record<string, { name: string; total: number; id: string }> = {};

  let total = 0;

  for (const exp of expenses) {
    const amt = Number(exp.amountUzs);
    total += amt;
    byCategory[exp.category] = (byCategory[exp.category] || 0) + amt;
    if (!byProject[exp.projectId]) {
      byProject[exp.projectId] = { name: exp.project.name, total: 0, id: exp.project.id };
    }
    byProject[exp.projectId].total += amt;
  }

  return { expenses, byCategory, byProject, total };
}

export default async function HarajatlarPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [kunlik, oylik, yillik] = await Promise.all([
    getExpenseReport("kunlik"),
    getExpenseReport("oylik"),
    getExpenseReport("yillik"),
  ]);

  // All expenses for listing
  const allExpenses = await db.expense.findMany({
    orderBy: { date: "desc" },
    take: 50,
    include: {
      project: { select: { name: true, id: true } },
      addedBy: { select: { fullName: true, id: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Harajatlar</h1>

      {/* Period reports */}
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
                <p className="text-sm text-gray-500">{label} jami harajat</p>
                <p className="text-3xl font-bold text-red-600">
                  {formatUZS(data.total)}
                </p>
              </CardContent>
            </Card>

            {/* By category */}
            {Object.keys(data.byCategory).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Turkum bo'yicha</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(data.byCategory)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, amount]) => (
                        <div key={cat} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {EXPENSE_CATEGORY_LABELS[cat]}
                          </span>
                          <span className="font-medium">{formatUZS(amount)}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* By project */}
            {Object.keys(data.byProject).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Loyiha bo'yicha</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.values(data.byProject)
                      .sort((a, b) => b.total - a.total)
                      .map((proj) => (
                        <Link
                          key={proj.id}
                          href={`/loyihalar/${proj.id}`}
                          className="flex justify-between text-sm hover:bg-gray-50 p-1 rounded"
                        >
                          <span className="text-blue-600 hover:underline">
                            {proj.name}
                          </span>
                          <span className="font-medium">{formatUZS(proj.total)}</span>
                        </Link>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expense list */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Harajatlar ro'yxati</CardTitle>
              </CardHeader>
              <CardContent>
                {data.expenses.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Bu davrda harajatlar yo'q
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant="secondary" className="text-xs">
                              {EXPENSE_CATEGORY_LABELS[expense.category]}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {formatDate(expense.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 truncate">
                            {expense.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            <Link
                              href={`/loyihalar/${expense.project.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {expense.project.name}
                            </Link>
                            {" • "}
                            {expense.addedBy.fullName}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-red-600 flex-shrink-0 ml-3">
                          {formatUZS(expense.amountUzs)}
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
