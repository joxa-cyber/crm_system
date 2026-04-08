import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatUZS, formatDate } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SalaryButton } from "@/components/workers/salary-button";
import { SalaryRow } from "@/components/workers/salary-row";
import { DeleteWorkerButton } from "@/components/workers/delete-worker-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function IshchiTafsilotPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const worker = await db.worker.findUnique({
    where: { id },
    include: {
      salaryPayments: {
        orderBy: { date: "desc" },
        include: { paidBy: { select: { fullName: true } } },
      },
      assignments: {
        include: { project: { select: { name: true, id: true, status: true } } },
      },
    },
  });

  if (!worker) notFound();

  const totalPaid = worker.salaryPayments.reduce(
    (sum, sp) => sum + Number(sp.amountUzs),
    0
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {worker.firstName} {worker.lastName}
          </h1>
          <p className="text-gray-500">{worker.position}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={worker.isActive ? "default" : "secondary"}>
            {worker.isActive ? "Faol" : "Nofaol"}
          </Badge>
          <Link href={`/ishchilar/${worker.id}/tahrirlash`}>
            <Button variant="outline" size="sm">Tahrirlash</Button>
          </Link>
          {session.user.role === "ADMIN" && (
            <DeleteWorkerButton workerId={worker.id} />
          )}
        </div>
      </div>

      {/* Info */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Telefon</p>
              <p className="font-medium">{worker.phone || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Tug'ilgan sana</p>
              <p className="font-medium">
                {worker.birthDate ? formatDate(worker.birthDate) : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Oylik maosh</p>
              <p className="font-medium">{formatUZS(worker.monthlySalary)}</p>
            </div>
            <div>
              <p className="text-gray-500">Jami berilgan</p>
              <p className="font-medium text-green-600">{formatUZS(totalPaid)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oylik berdim button */}
      <SalaryButton
        workerId={worker.id}
        defaultAmount={String(worker.monthlySalary)}
      />

      {/* Oylik tarixi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Oylik tarixi</CardTitle>
        </CardHeader>
        <CardContent>
          {worker.salaryPayments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Hali oylik berilmagan
            </p>
          ) : (
            <div className="space-y-2">
              {worker.salaryPayments.map((sp) => (
                <SalaryRow
                  key={sp.id}
                  payment={{
                    ...sp,
                    amount: String(sp.amount),
                    amountUzs: String(sp.amountUzs),
                  }}
                  canDelete={session.user.role === "ADMIN"}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loyihalari */}
      {worker.assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Loyihalari</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {worker.assignments.map((wa) => (
                <Link
                  key={wa.id}
                  href={`/loyihalar/${wa.project.id}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                >
                  <span className="text-sm text-blue-600">{wa.project.name}</span>
                  {wa.daysWorked && (
                    <span className="text-xs text-gray-500">{wa.daysWorked} kun</span>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
