"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { deleteInventoryItem } from "@/actions/inventory";
import { UseMaterialForm } from "./use-material-form";
import { EditInventoryForm } from "./edit-inventory-form";
import { RestockForm } from "./restock-form";
import { ReturnMaterialButton } from "./return-material-button";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Usage {
  id: string;
  quantity: string;
  returnedQty: string;
  date: string;
  note: string | null;
  projectName: string;
}

interface Restock {
  id: string;
  quantity: string;
  unitPrice: string;
  currency: string;
  date: string;
  note: string | null;
  supplierName: string | null;
}

interface InventoryCardProps {
  item: {
    id: string;
    name: string;
    unit: string;
    quantity: string;
    unitPrice: string;
    currency: string;
    minQuantity: string | null;
    createdAt: string;
    supplierName: string | null;
  };
  totalUsed: number;
  totalReturned: number;
  usages: Usage[];
  restocks: Restock[];
  projects: Project[];
  suppliers: Supplier[];
  isAdmin: boolean;
}

export function InventoryCard({
  item,
  totalUsed,
  totalReturned,
  usages,
  restocks,
  projects,
  suppliers,
  isAdmin,
}: InventoryCardProps) {
  const [mode, setMode] = useState<"view" | "use" | "edit" | "history" | "restock" | "restockHistory">("view");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const remaining = Number(item.quantity);
  const totalRestocked = restocks.reduce((sum, r) => sum + Number(r.quantity), 0);
  const isLow = item.minQuantity && remaining <= Number(item.minQuantity);
  const totalValue = remaining * Number(item.unitPrice);
  const netUsed = totalUsed - totalReturned;

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteInventoryItem(item.id);
    if (result?.error) {
      toast.error(result.error);
      setDeleting(false);
      setConfirmDelete(false);
    } else {
      toast.success("Material o'chirildi");
    }
  }

  return (
    <Card className={isLow ? "border-red-300 bg-red-50/30" : ""}>
      <CardContent className="pt-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <p className="text-xs text-gray-400">
              Kelgan: {new Date(item.createdAt).toLocaleDateString("uz-UZ")}
            </p>
            {item.supplierName && (
              <p className="text-xs text-purple-500">Yetkazuvchi: {item.supplierName}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isLow && (
              <Badge variant="destructive" className="text-xs">
                Kam qoldi!
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Ishlatilgan:</span>
            <span className="font-medium text-orange-600">
              {netUsed.toLocaleString("uz")} {item.unit}
              {totalReturned > 0 && (
                <span className="text-green-600 text-xs ml-1">(+{totalReturned} qaytgan)</span>
              )}
            </span>
          </div>
          {totalRestocked > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Qayta to'ldirilgan:</span>
              <span className="font-medium text-blue-600">
                +{totalRestocked.toLocaleString("uz")} {item.unit}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Qolgan:</span>
            <span className={`font-bold ${isLow ? "text-red-600" : "text-green-600"}`}>
              {remaining.toLocaleString("uz")} {item.unit}
            </span>
          </div>
          <div className="flex justify-between border-t pt-1.5">
            <span className="text-gray-500">Narx:</span>
            <span>{formatCurrency(item.unitPrice, item.currency)} / {item.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Qoldiq qiymati:</span>
            <span className="font-medium">{formatCurrency(totalValue, item.currency)}</span>
          </div>
        </div>

        {/* Action buttons */}
        {mode === "view" && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-xs"
              onClick={() => setMode("restock")}
            >
              + Tovar qo'shish
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-xs"
              onClick={() => setMode("use")}
              disabled={remaining <= 0}
            >
              Ishlatish
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setMode("edit")}
            >
              Tahrirlash
            </Button>
            {usages.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setMode("history")}
              >
                Ishlatish tarixi ({usages.length})
              </Button>
            )}
            {restocks.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs col-span-2"
                onClick={() => setMode("restockHistory")}
              >
                To'ldirish tarixi ({restocks.length})
              </Button>
            )}
            {isAdmin && (
              !confirmDelete ? (
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs col-span-2"
                  onClick={() => setConfirmDelete(true)}
                >
                  O'chirish
                </Button>
              ) : (
                <div className="flex gap-2 col-span-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs flex-1"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "O'chirilmoqda..." : "Tasdiqlash"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Bekor
                  </Button>
                </div>
              )
            )}
          </div>
        )}

        {/* Restock form */}
        {mode === "restock" && (
          <RestockForm
            inventoryItemId={item.id}
            unit={item.unit}
            currentPrice={item.unitPrice}
            currentCurrency={item.currency}
            suppliers={suppliers}
            onDone={() => setMode("view")}
          />
        )}

        {/* Use material form */}
        {mode === "use" && (
          <UseMaterialForm
            inventoryItemId={item.id}
            unit={item.unit}
            maxQuantity={remaining}
            projects={projects}
            onDone={() => setMode("view")}
          />
        )}

        {/* Edit form */}
        {mode === "edit" && (
          <EditInventoryForm
            item={item}
            onDone={() => setMode("view")}
          />
        )}

        {/* Usage history */}
        {mode === "history" && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Ishlatish tarixi</p>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => setMode("view")}>
                Yopish
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {usages.map((u) => {
                const usedQty = Number(u.quantity);
                const returned = Number(u.returnedQty);
                const maxReturn = usedQty - returned;
                return (
                  <div key={u.id} className="border-b border-gray-100 pb-2 last:border-0">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-gray-800">{u.projectName}</p>
                        <p className="text-gray-400">
                          {new Date(u.date).toLocaleDateString("uz-UZ")}
                          {u.note && ` • ${u.note}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-orange-600">
                          -{usedQty.toLocaleString("uz")} {item.unit}
                        </span>
                        {returned > 0 && (
                          <p className="text-green-600 text-xs">+{returned} qaytgan</p>
                        )}
                      </div>
                    </div>
                    <ReturnMaterialButton
                      usageId={u.id}
                      maxReturn={maxReturn}
                      unit={item.unit}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Restock history */}
        {mode === "restockHistory" && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-green-700">To'ldirish tarixi</p>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => setMode("view")}>
                Yopish
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {restocks.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-xs border-b border-green-100 pb-1.5 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">
                      {r.supplierName || "Noma'lum yetkazuvchi"}
                    </p>
                    <p className="text-gray-400">
                      {new Date(r.date).toLocaleDateString("uz-UZ")}
                      {r.note && ` • ${r.note}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-green-600">
                      +{Number(r.quantity).toLocaleString("uz")} {item.unit}
                    </span>
                    <p className="text-gray-400">
                      {formatCurrency(r.unitPrice, r.currency)} / {item.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
