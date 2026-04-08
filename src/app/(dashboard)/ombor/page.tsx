import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatUZS, formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InventoryForm } from "@/components/inventory/inventory-form";

export default async function OmborPage() {
  const session = await auth();
  if (!session?.user) return null;

  const items = await db.inventoryItem.findMany({
    orderBy: { name: "asc" },
  });

  const totalValue = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ombor</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-gray-500">Jami materiallar</p>
            <p className="text-3xl font-bold text-gray-900">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-gray-500">Ombor qiymati</p>
            <p className="text-2xl font-bold text-gray-900">{formatUZS(totalValue)}</p>
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
          {items.map((item) => {
            const isLow =
              item.minQuantity && Number(item.quantity) <= Number(item.minQuantity);
            return (
              <Card
                key={item.id}
                className={isLow ? "border-red-300 bg-red-50/30" : ""}
              >
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {isLow && (
                      <Badge variant="destructive" className="text-xs">
                        Kam qoldi!
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Miqdor:</span>
                      <span className="font-medium">
                        {Number(item.quantity).toLocaleString()} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Narx:</span>
                      <span>
                        {formatCurrency(item.unitPrice, item.currency)} / {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5">
                      <span className="text-gray-500">Jami:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          Number(item.quantity) * Number(item.unitPrice),
                          item.currency
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
