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
import { addEstimateItem } from "@/actions/estimates";
import { toast } from "sonner";

export function EstimateItemForm({ estimateId }: { estimateId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useWatt, setUseWatt] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" className="w-full">
        + Material/xizmat qo'shish
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("estimateId", estimateId);
    const result = await addEstimateItem(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Qo'shildi");
      setOpen(false);
      setUseWatt(false);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-blue-800">Yangi qator</p>
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={useWatt}
            onChange={(e) => setUseWatt(e.target.checked)}
            className="rounded"
          />
          Watt hisoblash (panel)
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Nomi *</Label>
          <Input name="name" placeholder="Masalan: Panel 635W" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Birlik</Label>
          <Input name="unit" placeholder="dona, metr, kg, kw" defaultValue="dona" className="h-9" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Miqdor *</Label>
          <AmountInput name="quantity" required className="h-9" />
        </div>
        {useWatt ? (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Watt (dona) *</Label>
              <AmountInput name="wattPerUnit" required className="h-9" placeholder="635" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Narx/Watt ($) *</Label>
              <AmountInput name="pricePerWatt" required className="h-9" placeholder="0.17" />
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <Label className="text-xs">Dona narxi *</Label>
            <AmountInput name="unitPrice" required={!useWatt} className="h-9" />
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-xs">Valyuta</Label>
          <Select name="currency" defaultValue="USD">
            <SelectTrigger className="h-9">
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

      {useWatt && (
        <input type="hidden" name="unitPrice" value="0" />
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size="sm" className="flex-1">
          {loading ? "Saqlanmoqda..." : "Qo'shish"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setOpen(false); setUseWatt(false); }}>
          Bekor
        </Button>
      </div>
    </form>
  );
}
