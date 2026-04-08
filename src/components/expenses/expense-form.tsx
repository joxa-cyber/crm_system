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
import { createExpense } from "@/actions/expenses";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/formatters";
import { toast } from "sonner";

export function ExpenseForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" className="w-full">
        + Harajat qo'shish
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("projectId", projectId);
    const result = await createExpense(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Harajat qo'shildi");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Yangi harajat</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Turkum *</Label>
              <Select name="category" required>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sana</Label>
              <Input
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="h-10"
              />
            </div>
          </div>

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

          <div className="space-y-1">
            <Label className="text-xs">Izoh (nima uchun) *</Label>
            <Input
              name="description"
              placeholder="Masalan: 10 ta quyosh panel sotib olindi"
              required
              className="h-10"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} size="sm" className="flex-1">
              {loading ? "Saqlanmoqda..." : "Qo'shish"}
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
