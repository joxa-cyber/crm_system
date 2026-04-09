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
import { updateInventoryItem } from "@/actions/inventory";
import { toast } from "sonner";

interface EditInventoryFormProps {
  item: {
    id: string;
    name: string;
    unit: string;
    quantity: string;
    unitPrice: string;
    currency: string;
    minQuantity: string | null;
  };
  onDone: () => void;
}

export function EditInventoryForm({ item, onDone }: EditInventoryFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateInventoryItem(item.id, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Material yangilandi");
      onDone();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
      <p className="text-sm font-semibold text-yellow-800">Tahrirlash</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Nomi *</Label>
          <Input name="name" defaultValue={item.name} required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Birlik *</Label>
          <Input name="unit" defaultValue={item.unit} required className="h-9" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Miqdor *</Label>
          <AmountInput name="quantity" defaultValue={item.quantity} required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Narx *</Label>
          <AmountInput name="unitPrice" defaultValue={item.unitPrice} required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Valyuta</Label>
          <Select name="currency" defaultValue={item.currency}>
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
          <Label className="text-xs">Min. miqdor</Label>
          <AmountInput name="minQuantity" defaultValue={item.minQuantity || ""} className="h-9" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size="sm" className="flex-1">
          {loading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Bekor
        </Button>
      </div>
    </form>
  );
}
