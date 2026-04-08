"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createServiceCategory } from "@/actions/settings";
import { toast } from "sonner";

export function CategoryForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        + Xizmat turi qo'shish
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createServiceCategory(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Xizmat turi qo'shildi");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input name="name" placeholder="Yangi xizmat turi nomi" required className="h-10" />
      <Button type="submit" disabled={loading} size="sm" className="h-10">
        {loading ? "..." : "Qo'shish"}
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-10" onClick={() => setOpen(false)}>
        Bekor
      </Button>
    </form>
  );
}
