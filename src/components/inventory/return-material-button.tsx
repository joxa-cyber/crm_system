"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { Label } from "@/components/ui/label";
import { returnMaterial } from "@/actions/inventory";
import { toast } from "sonner";

interface ReturnMaterialButtonProps {
  usageId: string;
  maxReturn: number;
  unit: string;
}

export function ReturnMaterialButton({ usageId, maxReturn, unit }: ReturnMaterialButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (maxReturn <= 0) return null;

  if (!open) {
    return (
      <Button size="sm" variant="outline" className="text-xs text-green-600 border-green-300" onClick={() => setOpen(true)}>
        Qaytarish
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("usageId", usageId);
    const result = await returnMaterial(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Material qaytarildi!");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 mt-1">
      <div className="space-y-0.5">
        <Label className="text-xs">Qaytarish (maks: {maxReturn} {unit})</Label>
        <AmountInput name="returnQty" required className="h-8 w-24 text-xs" />
      </div>
      <Button type="submit" disabled={loading} size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700">
        {loading ? "..." : "OK"}
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setOpen(false)}>
        x
      </Button>
    </form>
  );
}
