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
import { createPayment } from "@/actions/payments";
import { toast } from "sonner";

export function PaymentForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" className="w-full">
        + To'lov qo'shish
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("projectId", projectId);
    const result = await createPayment(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("To'lov qo'shildi");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Card className="border-green-200 bg-green-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Yangi to'lov</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Summa *</Label>
              <AmountInput
                name="amount"
                required
                className="h-10"
              />
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
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="RUB">RUB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Sana</Label>
              <Input
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Izoh</Label>
              <Input name="note" placeholder="Izoh" className="h-10" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} size="sm" className="flex-1">
              {loading ? "Saqlanmoqda..." : "To'lovni qo'shish"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Bekor
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
