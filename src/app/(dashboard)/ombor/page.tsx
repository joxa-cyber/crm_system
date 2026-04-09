import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { InventoryForm } from "@/components/inventory/inventory-form";
import { InventoryCard } from "@/components/inventory/inventory-card";

export default async function OmborPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [items, projects] = await Promise.all([
    db.inventoryItem.findMany({
      orderBy: { name: "asc" },
      include: {
        usages: {
          orderBy: { date: "desc" },
          include: {
            project: { select: { name: true } },
          },
        },
      },
    }),
    db.project.findMany({
      where: { status: { in: ["YANGI", "JARAYONDA"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Stats
  const valueByCurrency: Record<string, number> = {};
  let totalUsedAll = 0;
  const itemsData = items.map((item) => {
    const remaining = Number(item.quantity);
    const totalUsed = item.usages.reduce((sum, u) => sum + Number(u.quantity), 0);
    const unitPrice = Number(item.unitPrice);
    const val = remaining * unitPrice;
    valueByCurrency[item.currency] = (valueByCurrency[item.currency] || 0) + val;
    totalUsedAll += totalUsed;

    return {
      item: {
        id: item.id,
        name: item.name,
        unit: item.unit,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        currency: item.currency,
        minQuantity: item.minQuantity ? String(item.minQuantity) : null,
        createdAt: item.createdAt.toISOString(),
      },
      totalUsed,
      usages: item.usages.map((u) => ({
        id: u.id,
        quantity: String(u.quantity),
        date: u.date.toISOString(),
        note: u.note,
        projectName: u.project.name,
      })),
    };
  });

  const lowStockCount = items.filter(
    (i) => i.minQuantity && Number(i.quantity) <= Number(i.minQuantity)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ombor</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Jami materiallar</p>
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Ombor qiymati</p>
            <div>
              {Object.entries(valueByCurrency).map(([cur, val]) => (
                <p key={cur} className="text-lg font-bold text-gray-900">
                  {formatCurrency(val, cur)}
                </p>
              ))}
              {Object.keys(valueByCurrency).length === 0 && (
                <p className="text-lg font-bold text-gray-900">0</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Jami ishlatilgan</p>
            <p className="text-lg font-bold text-orange-600">{totalUsedAll.toLocaleString("uz")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Kam qolganlar</p>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {lowStockCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add form */}
      <InventoryForm />

      {/* Items */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Hali materiallar yo'q</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itemsData.map((data) => (
            <InventoryCard
              key={data.item.id}
              item={data.item}
              totalUsed={data.totalUsed}
              usages={data.usages}
              projects={projects}
              isAdmin={session.user.role === "ADMIN"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
