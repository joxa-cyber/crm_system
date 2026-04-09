import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { InventoryForm } from "@/components/inventory/inventory-form";
import { InventoryCard } from "@/components/inventory/inventory-card";
import { SupplierForm } from "@/components/inventory/supplier-form";

export default async function OmborPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [items, projects, suppliers] = await Promise.all([
    db.inventoryItem.findMany({
      orderBy: { name: "asc" },
      include: {
        supplier: { select: { name: true } },
        usages: {
          orderBy: { date: "desc" },
          include: {
            project: { select: { name: true } },
          },
        },
        restocks: {
          orderBy: { date: "desc" },
          include: {
            supplier: { select: { name: true } },
          },
        },
      },
    }),
    db.project.findMany({
      where: { status: { in: ["YANGI", "JARAYONDA"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.supplier.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true },
    }),
  ]);

  // Stats
  const valueByCurrency: Record<string, number> = {};
  let totalUsedAll = 0;
  let totalReturnedAll = 0;
  const itemsData = items.map((item) => {
    const remaining = Number(item.quantity);
    const totalUsed = item.usages.reduce((sum, u) => sum + Number(u.quantity), 0);
    const totalReturned = item.usages.reduce((sum, u) => sum + Number(u.returnedQty), 0);
    const unitPrice = Number(item.unitPrice);
    const val = remaining * unitPrice;
    valueByCurrency[item.currency] = (valueByCurrency[item.currency] || 0) + val;
    totalUsedAll += totalUsed;
    totalReturnedAll += totalReturned;

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
        supplierName: item.supplier?.name || null,
      },
      totalUsed,
      totalReturned,
      usages: item.usages.map((u) => ({
        id: u.id,
        quantity: String(u.quantity),
        returnedQty: String(u.returnedQty),
        date: u.date.toISOString(),
        note: u.note,
        projectName: u.project.name,
      })),
      restocks: item.restocks.map((r) => ({
        id: r.id,
        quantity: String(r.quantity),
        unitPrice: String(r.unitPrice),
        currency: r.currency,
        date: r.date.toISOString(),
        note: r.note,
        supplierName: r.supplier?.name || null,
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
        <Link href="/ombor/hisobot">
          <Button variant="outline" size="sm">Hisobot</Button>
        </Link>
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
            {totalReturnedAll > 0 && (
              <p className="text-xs text-green-600">+{totalReturnedAll} qaytgan</p>
            )}
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

      {/* Yetkazib beruvchilar */}
      {suppliers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Yetkazib beruvchilar</CardTitle>
              <SupplierForm />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suppliers.map((s) => (
                <div key={s.id} className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-sm">
                  <span className="font-medium">{s.name}</span>
                  {s.phone && <span className="text-gray-400 ml-1">• {s.phone}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {suppliers.length === 0 && <SupplierForm />}

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
              totalReturned={data.totalReturned}
              usages={data.usages}
              restocks={data.restocks}
              projects={projects}
              suppliers={suppliers}
              isAdmin={session.user.role === "ADMIN"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
