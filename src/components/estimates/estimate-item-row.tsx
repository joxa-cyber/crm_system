"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmountInput } from "@/components/ui/amount-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import { deleteEstimateItem, updateEstimateItem } from "@/actions/estimates";
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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [useWatt, setUseWatt] = useState(!!item.wattPerUnit && !!item.pricePerWatt);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteEstimateItem(item.id);
    if (result?.error) {
      toast.error(result.error);
      setDeleting(false);
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateEstimateItem(item.id, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Saqlandi");
      setEditing(false);
    }
    setSaving(false);
  }

  const qty = Number(item.quantity);
  const hasWatt = item.wattPerUnit && item.pricePerWatt;
  const watt = Number(item.wattPerUnit || 0);
  const ppw = Number(item.pricePerWatt || 0);
  const totalWatt = qty * watt;

  if (editing) {
    return (
      <form onSubmit={handleSave} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 my-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-yellow-800">Tahrirlash</p>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={useWatt}
              onChange={(e) => setUseWatt(e.target.checked)}
              className="rounded"
            />
            Watt hisoblash
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Nomi</Label>
            <Input name="name" defaultValue={item.name} required className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Birlik</Label>
            <Input name="unit" defaultValue={item.unit} className="h-8 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          <div className="space-y-1">
            <Label className="text-xs">Miqdor</Label>
            <AmountInput name="quantity" defaultValue={item.quantity} required className="h-8 text-sm" />
          </div>
          {useWatt ? (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Watt (dona)</Label>
                <AmountInput name="wattPerUnit" defaultValue={item.wattPerUnit || ""} required className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Narx/Watt ($)</Label>
                <AmountInput name="pricePerWatt" defaultValue={item.pricePerWatt || ""} required className="h-8 text-sm" />
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <Label className="text-xs">Dona narxi</Label>
              <AmountInput name="unitPrice" defaultValue={item.unitPrice} required={!useWatt} className="h-8 text-sm" />
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Valyuta</Label>
            <Select name="currency" defaultValue={item.currency}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="UZS">UZS</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="RUB">RUB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {useWatt && <input type="hidden" name="unitPrice" value="0" />}

        <div className="flex gap-2 mt-2">
          <Button type="submit" disabled={saving} size="sm" className="flex-1 h-7 text-xs">
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(false)}>
            Bekor
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 group">
      <span className="text-xs text-gray-400 w-6 text-center">{index + 1}</span>
      <div
        className="flex-1 min-w-0 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
        onClick={() => setEditing(true)}
        title="Tahrirlash uchun bosing"
      >
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
        className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 print:hidden"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? "..." : "×"}
      </Button>
    </div>
  );
}
