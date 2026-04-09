import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OmborHisobotPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [items, usages] = await Promise.all([
    db.inventoryItem.findMany({
      include: {
        usages: {
          include: {
            project: { select: { id: true, name: true } },
          },
        },
        restocks: {
          include: {
            supplier: { select: { name: true } },
          },
        },
      },
    }),
    db.materialUsage.findMany({
      include: {
        inventoryItem: { select: { name: true, unit: true, unitPrice: true, currency: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  // 1. Loyiha bo'yicha material sarfi
  const projectMaterials: Record<string, {
    projectName: string;
    projectId: string;
    items: { name: string; quantity: number; unit: string; cost: number; currency: string }[];
    totalByCurrency: Record<string, number>;
  }> = {};

  for (const u of usages) {
    const pid = u.project.id;
    if (!projectMaterials[pid]) {
      projectMaterials[pid] = {
        projectName: u.project.name,
        projectId: pid,
        items: [],
        totalByCurrency: {},
      };
    }
    const qty = Number(u.quantity) - Number(u.returnedQty);
    const cost = qty * Number(u.inventoryItem.unitPrice);
    const cur = u.inventoryItem.currency;
    projectMaterials[pid].items.push({
      name: u.inventoryItem.name,
      quantity: qty,
      unit: u.inventoryItem.unit,
      cost,
      currency: cur,
    });
    projectMaterials[pid].totalByCurrency[cur] = (projectMaterials[pid].totalByCurrency[cur] || 0) + cost;
  }

  // 2. Eng ko'p ishlatilgan materiallar
  const materialUsage: Record<string, { name: string; unit: string; totalUsed: number; currency: string; totalCost: number }> = {};
  for (const item of items) {
    const totalUsed = item.usages.reduce((sum, u) => sum + Number(u.quantity) - Number(u.returnedQty), 0);
    if (totalUsed > 0) {
      materialUsage[item.id] = {
        name: item.name,
        unit: item.unit,
        totalUsed,
        currency: item.currency,
        totalCost: totalUsed * Number(item.unitPrice),
      };
    }
  }
  const topMaterials = Object.values(materialUsage).sort((a, b) => b.totalCost - a.totalCost);

  // 3. Kam qolgan materiallar
  const lowStock = items
    .filter((i) => i.minQuantity && Number(i.quantity) <= Number(i.minQuantity))
    .map((i) => ({
      name: i.name,
      unit: i.unit,
      remaining: Number(i.quantity),
      minQuantity: Number(i.minQuantity),
      currency: i.currency,
      unitPrice: Number(i.unitPrice),
    }));

  // 4. Yetkazuvchi bo'yicha xaridlar
  const supplierPurchases: Record<string, { name: string; totalByCurrency: Record<string, number>; count: number }> = {};
  for (const item of items) {
    for (const r of item.restocks) {
      const sName = r.supplier?.name || "Noma'lum";
      if (!supplierPurchases[sName]) {
        supplierPurchases[sName] = { name: sName, totalByCurrency: {}, count: 0 };
      }
      const cost = Number(r.quantity) * Number(r.unitPrice);
      supplierPurchases[sName].totalByCurrency[r.currency] = (supplierPurchases[sName].totalByCurrency[r.currency] || 0) + cost;
      supplierPurchases[sName].count++;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ombor hisoboti</h1>
        <Link href="/ombor">
          <Button variant="outline" size="sm">Omborga qaytish</Button>
        </Link>
      </div>

      {/* Eng ko'p ishlatilgan materiallar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Eng ko'p ishlatilgan materiallar</CardTitle>
        </CardHeader>
        <CardContent>
          {topMaterials.length === 0 ? (
            <p className="text-gray-500 text-sm">Hali material ishlatilmagan</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4 font-medium text-gray-500">Material</th>
                    <th className="py-2 pr-4 font-medium text-gray-500 text-right">Ishlatilgan</th>
                    <th className="py-2 font-medium text-gray-500 text-right">Qiymati</th>
                  </tr>
                </thead>
                <tbody>
                  {topMaterials.map((m, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 pr-4">{m.name}</td>
                      <td className="py-2 pr-4 text-right text-orange-600 font-medium">
                        {m.totalUsed.toLocaleString("uz")} {m.unit}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatCurrency(m.totalCost, m.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loyiha bo'yicha material sarfi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Loyiha bo'yicha material sarfi</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(projectMaterials).length === 0 ? (
            <p className="text-gray-500 text-sm">Hali material ishlatilmagan</p>
          ) : (
            <div className="space-y-4">
              {Object.values(projectMaterials).map((p) => (
                <div key={p.projectId} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Link href={`/loyihalar/${p.projectId}`} className="font-semibold text-blue-600 hover:underline">
                      {p.projectName}
                    </Link>
                    <div className="text-right">
                      {Object.entries(p.totalByCurrency).map(([cur, val]) => (
                        <p key={cur} className="text-sm font-bold">{formatCurrency(val, cur)}</p>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {p.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span>{item.name}</span>
                        <span>{item.quantity.toLocaleString("uz")} {item.unit} = {formatCurrency(item.cost, item.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kam qolgan materiallar */}
      {lowStock.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Kam qolgan materiallar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-red-50 rounded text-sm">
                  <span className="font-medium">{m.name}</span>
                  <div className="text-right">
                    <span className="text-red-600 font-bold">{m.remaining} {m.unit}</span>
                    <span className="text-gray-400 ml-2">(min: {m.minQuantity})</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yetkazuvchilar bo'yicha */}
      {Object.keys(supplierPurchases).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Yetkazuvchilar bo'yicha xaridlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4 font-medium text-gray-500">Yetkazuvchi</th>
                    <th className="py-2 pr-4 font-medium text-gray-500 text-right">Xaridlar soni</th>
                    <th className="py-2 font-medium text-gray-500 text-right">Jami summa</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(supplierPurchases).map((s, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 pr-4 font-medium">{s.name}</td>
                      <td className="py-2 pr-4 text-right">{s.count}</td>
                      <td className="py-2 text-right">
                        {Object.entries(s.totalByCurrency).map(([cur, val]) => (
                          <p key={cur} className="font-medium">{formatCurrency(val, cur)}</p>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
