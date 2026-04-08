"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmountInput } from "@/components/ui/amount-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSalaryPayment } from "@/actions/salary";
import { toast } from "sonner";

interface SalaryButtonProps {
  workerId: string;
  defaultAmount: string;
}

export function SalaryButton({ workerId, defaultAmount }: SalaryButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700"
      >
        Oylik berdim
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("workerId", workerId);
    const result = await createSalaryPayment(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Oylik berildi!");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Card className="border-green-200 bg-green-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Oylik berish</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Summa *</Label>
              <AmountInput
                name="amount"
                defaultValue={defaultAmount}
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
            <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
              {loading ? "Saqlanmoqda..." : "Oylik berdim"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Bekor
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
