import { db } from "@/lib/db";
import { formatUZS, formatDate } from "@/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function IshchilarPage() {
  const workers = await db.worker.findMany({
    orderBy: [{ isActive: "desc" }, { firstName: "asc" }],
    include: {
      _count: { select: { salaryPayments: true } },
      salaryPayments: {
        select: { amountUzs: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ishchilar</h1>
        <Link href="/ishchilar/yangi">
          <Button>+ Yangi ishchi</Button>
        </Link>
      </div>

      {workers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Hali ishchilar yo'q</p>
            <Link href="/ishchilar/yangi">
              <Button>Birinchi ishchini qo'shing</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((worker) => {
            const totalPaid = worker.salaryPayments.reduce(
              (sum, sp) => sum + Number(sp.amountUzs),
              0
            );
            return (
              <Link key={worker.id} href={`/ishchilar/${worker.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {worker.firstName} {worker.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{worker.position}</p>
                      </div>
                      <Badge variant={worker.isActive ? "default" : "secondary"}>
                        {worker.isActive ? "Faol" : "Nofaol"}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      {worker.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Telefon:</span>
                          <span>{worker.phone}</span>
                        </div>
                      )}
                      {worker.birthDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tug'ilgan:</span>
                          <span>{formatDate(worker.birthDate)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Oylik maosh:</span>
                        <span className="font-medium">{formatUZS(worker.monthlySalary)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1.5">
                        <span className="text-gray-500">Jami berilgan:</span>
                        <span className="font-medium text-green-600">
                          {formatUZS(totalPaid)}
                        </span>
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
