import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatUZS, formatCurrency, formatDate, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, EXPENSE_CATEGORY_LABELS } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ProjectStatusSelect } from "@/components/projects/project-status-select";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { PaymentForm } from "@/components/projects/payment-form";
import { ExpenseRow } from "@/components/expenses/expense-row";
import { PaymentRow } from "@/components/projects/payment-row";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LoyihaTafsilotPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      serviceCategory: true,
      createdBy: { select: { fullName: true } },
      expenses: {
        orderBy: { date: "desc" },
        include: { addedBy: { select: { fullName: true, id: true } } },
      },
      payments: {
        orderBy: { date: "desc" },
        include: { recordedBy: { select: { fullName: true } } },
      },
      workerAssignments: {
        include: { worker: true },
      },
    },
  });

  if (!project) notFound();

  const totalExpenses = project.expenses.reduce(
    (sum, e) => sum + Number(e.amountUzs),
    0
  );
  const totalPayments = project.payments.reduce(
    (sum, p) => sum + Number(p.amountUzs),
    0
  );
  const contractUzs = Number(project.contractAmountUzs);
  const profit = contractUzs - totalExpenses;
  const paymentRemaining = contractUzs - totalPayments;

  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  for (const expense of project.expenses) {
    const cat = expense.category;
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(expense.amountUzs);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <Badge className={PROJECT_STATUS_COLORS[project.status]} variant="secondary">
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            {project.serviceCategory.name} • Yaratdi: {project.createdBy.fullName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProjectStatusSelect projectId={project.id} currentStatus={project.status} />
          {session.user.role === "ADMIN" && (
            <Link href={`/loyihalar/${project.id}/tahrirlash`}>
              <Button variant="outline" size="sm">Tahrirlash</Button>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 mb-1">Shartnoma</p>
            <p className="text-lg font-bold text-gray-900">{formatUZS(contractUzs)}</p>
            {project.currency !== "UZS" && (
              <p className="text-xs text-gray-400">
                {formatCurrency(project.contractAmount, project.currency)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 mb-1">Harajatlar</p>
            <p className="text-lg font-bold text-red-600">{formatUZS(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 mb-1">To'langan</p>
            <p className="text-lg font-bold text-green-600">{formatUZS(totalPayments)}</p>
            {paymentRemaining > 0 && (
              <p className="text-xs text-gray-400">
                Qoldiq: {formatUZS(paymentRemaining)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 mb-1">Foyda</p>
            <p className={`text-lg font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatUZS(profit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mijoz info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mijoz ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Ism</p>
              <p className="font-medium">{project.clientName}</p>
            </div>
            <div>
              <p className="text-gray-500">Telefon</p>
              <p className="font-medium">{project.clientPhone}</p>
            </div>
            <div>
              <p className="text-gray-500">Manzil</p>
              <p className="font-medium">{project.clientAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="harajatlar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="harajatlar">
            Harajatlar ({project.expenses.length})
          </TabsTrigger>
          <TabsTrigger value="tolovlar">
            To'lovlar ({project.payments.length})
          </TabsTrigger>
          <TabsTrigger value="ishchilar">
            Ishchilar ({project.workerAssignments.length})
          </TabsTrigger>
        </TabsList>

        {/* Harajatlar tab */}
        <TabsContent value="harajatlar" className="space-y-4">
          {/* Expense breakdown by category */}
          {Object.keys(expensesByCategory).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Turkum bo'yicha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(expensesByCategory).map(([cat, amount]) => (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="text-gray-600">{EXPENSE_CATEGORY_LABELS[cat]}</span>
                      <span className="font-medium">{formatUZS(amount)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between text-sm font-bold">
                    <span>Jami</span>
                    <span className="text-red-600">{formatUZS(totalExpenses)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add expense form */}
          <ExpenseForm projectId={project.id} />

          {/* Expenses list */}
          {project.expenses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Hali harajatlar qo'shilmagan
            </p>
          ) : (
            <div className="space-y-2">
              {project.expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={{
                    ...expense,
                    amount: String(expense.amount),
                    amountUzs: String(expense.amountUzs),
                  }}
                  canEdit={
                    session.user.role === "ADMIN" ||
                    expense.addedBy.id === session.user.id
                  }
                  canDelete={session.user.role === "ADMIN"}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* To'lovlar tab */}
        <TabsContent value="tolovlar" className="space-y-4">
          <PaymentForm projectId={project.id} />

          {project.payments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Hali to'lovlar yo'q
            </p>
          ) : (
            <div className="space-y-2">
              {project.payments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={{
                    ...payment,
                    amount: String(payment.amount),
                    amountUzs: String(payment.amountUzs),
                  }}
                  canDelete={session.user.role === "ADMIN"}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Ishchilar tab */}
        <TabsContent value="ishchilar" className="space-y-4">
          {project.workerAssignments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Hali ishchilar biriktirilmagan
            </p>
          ) : (
            <div className="space-y-2">
              {project.workerAssignments.map((wa) => (
                <Card key={wa.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {wa.worker.firstName} {wa.worker.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{wa.worker.position}</p>
                    </div>
                    {wa.daysWorked && (
                      <p className="text-sm text-gray-600">{wa.daysWorked} kun</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
