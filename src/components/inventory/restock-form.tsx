"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmountInput } from "@/components/ui/amount-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { restockInventoryItem } from "@/actions/inventory";
import { toast } from "sonner";

interface Supplier {
  id: string;
  name: string;
}

interface RestockFormProps {
  inventoryItemId: string;
  unit: string;
  currentPrice: string;
  currentCurrency: string;
  suppliers: Supplier[];
  onDone: () => void;
}

export function RestockForm({
  inventoryItemId,
  unit,
  currentPrice,
  currentCurrency,
  suppliers,
  onDone,
}: RestockFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("inventoryItemId", inventoryItemId);
    const result = await restockInventoryItem(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Tovar qo'shildi!");
      onDone();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
      <p className="text-sm font-semibold text-green-800">Tovar qo'shish (qayta to'ldirish)</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Miqdor * ({unit})</Label>
          <AmountInput name="quantity" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Narx (dona)</Label>
          <AmountInput name="unitPrice" defaultValue={currentPrice} className="h-9" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Valyuta</Label>
          <Select name="currency" defaultValue={currentCurrency}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UZS">UZS</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Sana</Label>
          <Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Yetkazuvchi</Label>
          <Select name="supplierId">
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Tanlang" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Izoh</Label>
        <Input name="note" placeholder="Izoh" className="h-9" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
          {loading ? "Saqlanmoqda..." : "Qo'shish"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Bekor
        </Button>
      </div>
    </form>
  );
}
