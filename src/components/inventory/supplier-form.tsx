"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupplier } from "@/actions/inventory";
import { toast } from "sonner";

export function SupplierForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        + Yetkazib beruvchi
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createSupplier(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Yetkazib beruvchi qo'shildi");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Yangi yetkazib beruvchi</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Nomi *</Label>
              <Input name="name" placeholder="Masalan: Toshkent Solar Market" required className="h-10" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Telefon</Label>
              <Input name="phone" placeholder="+998901234567" className="h-10" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Manzil</Label>
              <Input name="address" placeholder="Manzil" className="h-10" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Izoh</Label>
              <Input name="notes" placeholder="Qo'shimcha" className="h-10" />
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
