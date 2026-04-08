import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManagerForm } from "@/components/settings/manager-form";
import { CategoryForm } from "@/components/settings/category-form";
import { ExchangeRates } from "@/components/settings/exchange-rates";
import { DeleteManagerButton } from "@/components/settings/delete-manager-button";

export default async function SozlamalarPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const [users, categories, rates] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, fullName: true, role: true, phone: true },
    }),
    db.serviceCategory.findMany({ orderBy: { name: "asc" } }),
    db.exchangeRate.findMany({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      orderBy: { currency: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>

      {/* Menejerlar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Foydalanuvchilar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {user.email} • {user.role === "ADMIN" ? "CEO" : "Menejer"}
                  </p>
                </div>
                {user.role !== "ADMIN" && (
                  <DeleteManagerButton userId={user.id} />
                )}
              </div>
            ))}
          </div>
          <ManagerForm />
        </CardContent>
      </Card>

      {/* Xizmat turlari */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Xizmat turlari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="px-3 py-1.5 bg-gray-100 rounded-full text-sm"
              >
                {cat.name}
              </span>
            ))}
          </div>
          <CategoryForm />
        </CardContent>
      </Card>

      {/* Valyuta kurslari */}
      <ExchangeRates
        rates={rates.map((r) => ({
          currency: r.currency,
          rate: String(r.rate),
        }))}
      />
    </div>
  );
}
