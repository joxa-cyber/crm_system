import { db } from "@/lib/db";
import { formatUZS } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, EXPENSE_CATEGORY_LABELS } from "@/lib/formatters";
import Link from "next/link";

async function getDashboardData() {
  const [
    projects,
    expenses,
    payments,
    salaryPayments,
    recentExpenses,
    recentPayments,
  ] = await Promise.all([
    db.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        contractAmountUzs: true,
        clientName: true,
        createdAt: true,
      },
    }),
    db.expense.aggregate({
      _sum: { amountUzs: true },
    }),
    db.projectPayment.aggregate({
      _sum: { amountUzs: true },
    }),
    db.salaryPayment.aggregate({
      _sum: { amountUzs: true },
    }),
    db.expense.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { name: true } },
        addedBy: { select: { fullName: true } },
      },
    }),
    db.projectPayment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { name: true } },
        recordedBy: { select: { fullName: true } },
      },
    }),
  ]);

  const totalContractAmount = projects.reduce(
    (sum, p) => sum + Number(p.contractAmountUzs),
    0
  );
  const totalExpenses = Number(expenses._sum.amountUzs || 0);
  const totalPayments = Number(payments._sum.amountUzs || 0);
  const totalSalary = Number(salaryPayments._sum.amountUzs || 0);
  const activeProjects = projects.filter((p) => p.status === "JARAYONDA").length;
  const profit = totalContractAmount - totalExpenses - totalSalary;

  return {
    totalContractAmount,
    totalExpenses,
    totalPayments,
    totalSalary,
    activeProjects,
    totalProjects: projects.length,
    profit,
    recentExpenses,
    recentPayments,
    projects,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bosh sahifa</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Jami daromad (shartnomalar)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatUZS(data.totalContractAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Jami harajatlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatUZS(data.totalExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Jami oyliklar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {formatUZS(data.totalSalary)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Sof foyda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                data.profit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatUZS(data.profit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Kelgan to'lovlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatUZS(data.totalPayments)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Jami loyihalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{data.totalProjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Faol loyihalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{data.activeProjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Qolgan qarz (mijozdan)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${data.totalContractAmount - data.totalPayments > 0 ? "text-orange-600" : "text-green-600"}`}>
              {formatUZS(data.totalContractAmount - data.totalPayments)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent expenses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">So'nggi harajatlar</CardTitle>
              <Link href="/harajatlar" className="text-sm text-blue-600 hover:underline">
                Barchasini ko'rish
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentExpenses.length === 0 ? (
              <p className="text-gray-500 text-sm">Hali harajatlar yo'q</p>
            ) : (
              <div className="space-y-3">
                {data.recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {expense.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {expense.project.name} • {EXPENSE_CATEGORY_LABELS[expense.category]} • {expense.addedBy.fullName}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-red-600">
                      -{formatUZS(expense.amountUzs)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent payments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">So'nggi to'lovlar</CardTitle>
              <Link href="/loyihalar" className="text-sm text-blue-600 hover:underline">
                Loyihalarga o'tish
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentPayments.length === 0 ? (
              <p className="text-gray-500 text-sm">Hali to'lovlar yo'q</p>
            ) : (
              <div className="space-y-3">
                {data.recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {payment.project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payment.note || "To'lov"} • {payment.recordedBy.fullName}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-green-600">
                      +{formatUZS(payment.amountUzs)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
