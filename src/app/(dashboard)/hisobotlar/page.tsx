import { db } from "@/lib/db";
import { formatUZS } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROJECT_STATUS_LABELS } from "@/lib/formatters";
import Link from "next/link";

export default async function HisobotlarPage() {
  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      serviceCategory: true,
      expenses: { select: { amountUzs: true, category: true } },
      payments: { select: { amountUzs: true } },
    },
  });

  // Overall stats
  let totalContractAmount = 0;
  let totalExpenses = 0;
  let totalPayments = 0;

  const projectReports = projects.map((p) => {
    const contract = Number(p.contractAmountUzs);
    const expenses = p.expenses.reduce((sum, e) => sum + Number(e.amountUzs), 0);
    const payments = p.payments.reduce((sum, pay) => sum + Number(pay.amountUzs), 0);
    const profit = contract - expenses;
    const margin = contract > 0 ? ((profit / contract) * 100) : 0;

    totalContractAmount += contract;
    totalExpenses += expenses;
    totalPayments += payments;

    return {
      id: p.id,
      name: p.name,
      category: p.serviceCategory.name,
      status: p.status,
      contract,
      expenses,
      payments,
      profit,
      margin,
    };
  });

  const totalProfit = totalContractAmount - totalExpenses;

  // Salary total
  const salaryTotal = await db.salaryPayment.aggregate({
    _sum: { amountUzs: true },
  });
  const totalSalary = Number(salaryTotal._sum.amountUzs || 0);
  const netProfit = totalPayments - totalExpenses - totalSalary;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hisobotlar</h1>

      {/* Overall summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Shartnomalar jami</p>
            <p className="text-lg font-bold">{formatUZS(totalContractAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">To'lovlar jami</p>
            <p className="text-lg font-bold text-green-600">{formatUZS(totalPayments)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Harajatlar + Oyliklar</p>
            <p className="text-lg font-bold text-red-600">
              {formatUZS(totalExpenses + totalSalary)}
            </p>
            <p className="text-xs text-gray-400">
              Harajat: {formatUZS(totalExpenses)} | Oylik: {formatUZS(totalSalary)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Sof foyda</p>
            <p className={`text-lg font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatUZS(netProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-project report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Loyiha bo'yicha foyda</CardTitle>
        </CardHeader>
        <CardContent>
          {projectReports.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Loyihalar yo'q</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4 font-medium text-gray-500">Loyiha</th>
                    <th className="py-2 pr-4 font-medium text-gray-500 text-right">Shartnoma</th>
                    <th className="py-2 pr-4 font-medium text-gray-500 text-right">Harajat</th>
                    <th className="py-2 pr-4 font-medium text-gray-500 text-right">Foyda</th>
                    <th className="py-2 font-medium text-gray-500 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {projectReports.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 pr-4">
                        <Link href={`/loyihalar/${p.id}`} className="text-blue-600 hover:underline">
                          {p.name}
                        </Link>
                        <p className="text-xs text-gray-400">
                          {p.category} • {PROJECT_STATUS_LABELS[p.status]}
                        </p>
                      </td>
                      <td className="py-2.5 pr-4 text-right font-medium">
                        {formatUZS(p.contract)}
                      </td>
                      <td className="py-2.5 pr-4 text-right text-red-600">
                        {formatUZS(p.expenses)}
                      </td>
                      <td className={`py-2.5 pr-4 text-right font-bold ${p.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatUZS(p.profit)}
                      </td>
                      <td className={`py-2.5 text-right ${p.margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {p.margin.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td className="py-2.5 pr-4">JAMI</td>
                    <td className="py-2.5 pr-4 text-right">{formatUZS(totalContractAmount)}</td>
                    <td className="py-2.5 pr-4 text-right text-red-600">{formatUZS(totalExpenses)}</td>
                    <td className={`py-2.5 pr-4 text-right ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatUZS(totalProfit)}
                    </td>
                    <td className="py-2.5 text-right">
                      {totalContractAmount > 0 ? ((totalProfit / totalContractAmount) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
