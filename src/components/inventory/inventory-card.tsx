"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { deleteInventoryItem } from "@/actions/inventory";
import { UseMaterialForm } from "./use-material-form";
import { EditInventoryForm } from "./edit-inventory-form";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface Usage {
  id: string;
  quantity: string;
  date: string;
  note: string | null;
  projectName: string;
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
  };
  totalUsed: number;
  usages: Usage[];
  projects: Project[];
  isAdmin: boolean;
}

export function InventoryCard({ item, totalUsed, usages, projects, isAdmin }: InventoryCardProps) {
  const [mode, setMode] = useState<"view" | "use" | "edit" | "history">("view");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const remaining = Number(item.quantity);
  const totalBought = remaining + totalUsed;
  const isLow = item.minQuantity && remaining <= Number(item.minQuantity);
  const totalValue = remaining * Number(item.unitPrice);

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
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
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
            <span className="text-gray-500">Jami kelgan:</span>
            <span className="font-medium">
              {totalBought.toLocaleString("uz")} {item.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Ishlatilgan:</span>
            <span className="font-medium text-orange-600">
              {totalUsed.toLocaleString("uz")} {item.unit}
            </span>
          </div>
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
                className="text-xs col-span-2"
                onClick={() => setMode("history")}
              >
                Tarix ({usages.length})
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
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {usages.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-xs border-b border-gray-100 pb-1.5 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{u.projectName}</p>
                    <p className="text-gray-400">
                      {new Date(u.date).toLocaleDateString("uz-UZ")}
                      {u.note && ` • ${u.note}`}
                    </p>
                  </div>
                  <span className="font-semibold text-orange-600">
                    -{Number(u.quantity).toLocaleString("uz")} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
