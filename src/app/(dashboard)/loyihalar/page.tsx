import { db } from "@/lib/db";
import { formatUZS, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LoyihalarPage() {
  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      serviceCategory: true,
      _count: { select: { expenses: true } },
      expenses: { select: { amountUzs: true } },
      payments: { select: { amountUzs: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Loyihalar</h1>
        <Link href="/loyihalar/yangi">
          <Button>+ Yangi loyiha</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Hali loyihalar yo'q</p>
            <Link href="/loyihalar/yangi">
              <Button>Birinchi loyihani yarating</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const totalExpenses = project.expenses.reduce(
              (sum, e) => sum + Number(e.amountUzs),
              0
            );
            const totalPayments = project.payments.reduce(
              (sum, p) => sum + Number(p.amountUzs),
              0
            );
            const profit = Number(project.contractAmountUzs) - totalExpenses;

            return (
              <Link key={project.id} href={`/loyihalar/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight">
                        {project.name}
                      </CardTitle>
                      <Badge
                        className={PROJECT_STATUS_COLORS[project.status]}
                        variant="secondary"
                      >
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {project.serviceCategory.name}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Mijoz:</span>
                      <span className="font-medium">{project.clientName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shartnoma:</span>
                      <span className="font-medium">
                        {formatUZS(project.contractAmountUzs)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Harajatlar:</span>
                      <span className="font-medium text-red-600">
                        {formatUZS(totalExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">To'langan:</span>
                      <span className="font-medium text-green-600">
                        {formatUZS(totalPayments)}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-sm">
                      <span className="text-gray-500">Foyda:</span>
                      <span
                        className={`font-bold ${
                          profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatUZS(profit)}
                      </span>
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
