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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createInventoryItem } from "@/actions/inventory";
import { toast } from "sonner";

export function InventoryForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" className="w-full">
        + Material qo'shish
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createInventoryItem(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Material qo'shildi");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Yangi material</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Nomi *</Label>
              <Input name="name" placeholder="Masalan: Quyosh panel 400W" required className="h-10" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Birlik *</Label>
              <Input name="unit" placeholder="dona, metr, kg" required className="h-10" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Miqdor *</Label>
              <AmountInput name="quantity" required className="h-10" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Narx *</Label>
              <AmountInput name="unitPrice" required className="h-10" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Valyuta</Label>
              <Select name="currency" defaultValue="UZS">
                <SelectTrigger className="h-10">
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
              <AmountInput name="minQuantity" className="h-10" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} size="sm" className="flex-1">
              {loading ? "Saqlanmoqda..." : "Qo'shish"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Bekor
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
