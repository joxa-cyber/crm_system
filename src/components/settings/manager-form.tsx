"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createManager } from "@/actions/users";
import { toast } from "sonner";

export function ManagerForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        + Menejer qo'shish
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createManager(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Menejer qo'shildi");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">To'liq ism *</Label>
          <Input name="fullName" placeholder="Ism Familiya" required className="h-10" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Telefon</Label>
          <Input name="phone" placeholder="+998..." className="h-10" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Email *</Label>
          <Input name="email" type="email" placeholder="email@example.com" required className="h-10" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Parol *</Label>
          <Input name="password" type="password" placeholder="Kamida 6 belgi" required className="h-10" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Saqlanmoqda..." : "Qo'shish"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Bekor
        </Button>
      </div>
    </form>
  );
}
