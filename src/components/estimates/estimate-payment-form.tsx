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
import { addEstimatePayment } from "@/actions/estimates";
import { toast } from "sonner";

export function EstimatePaymentForm({ estimateId }: { estimateId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm" className="w-full">
        + To'lov qo'shish
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("estimateId", estimateId);
    const result = await addEstimatePayment(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("To'lov qo'shildi");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-green-50 rounded-lg border border-green-200">
      <p className="text-sm font-semibold text-green-800">To'lov qo'shish</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Summa *</Label>
          <AmountInput name="amount" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Valyuta</Label>
          <Select name="currency" defaultValue="UZS">
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
          <Label className="text-xs">Izoh</Label>
          <Input name="note" placeholder="Izoh" className="h-9" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
          {loading ? "Saqlanmoqda..." : "Qo'shish"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Bekor
        </Button>
      </div>
    </form>
  );
}
