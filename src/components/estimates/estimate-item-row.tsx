"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { deleteEstimateItem } from "@/actions/estimates";
import { toast } from "sonner";

interface EstimateItemRowProps {
  item: {
    id: string;
    name: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    currency: string;
    wattPerUnit: string | null;
    pricePerWatt: string | null;
    totalAmount: string;
  };
  index: number;
}

export function EstimateItemRow({ item, index }: EstimateItemRowProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteEstimateItem(item.id);
    if (result?.error) {
      toast.error(result.error);
      setDeleting(false);
    }
  }

  const qty = Number(item.quantity);
  const hasWatt = item.wattPerUnit && item.pricePerWatt;
  const watt = Number(item.wattPerUnit || 0);
  const ppw = Number(item.pricePerWatt || 0);
  const totalWatt = qty * watt;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 group">
      <span className="text-xs text-gray-400 w-6 text-center">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-xs text-gray-400">
          {qty.toLocaleString("uz")} {item.unit}
          {hasWatt
            ? ` × ${watt}W × ${formatCurrency(ppw, item.currency)}/W = ${totalWatt.toLocaleString("uz")}W`
            : ` × ${formatCurrency(item.unitPrice, item.currency)}`}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">{formatCurrency(item.totalAmount, item.currency)}</p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? "..." : "×"}
      </Button>
    </div>
  );
}
