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
import { useMaterial } from "@/actions/inventory";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface UseMaterialFormProps {
  inventoryItemId: string;
  unit: string;
  maxQuantity: number;
  projects: Project[];
  onDone: () => void;
}

export function UseMaterialForm({
  inventoryItemId,
  unit,
  maxQuantity,
  projects,
  onDone,
}: UseMaterialFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("inventoryItemId", inventoryItemId);
    const result = await useMaterial(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Material ishlatildi");
      onDone();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <p className="text-sm font-semibold text-blue-800">Material ishlatish</p>
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Loyiha *</Label>
          <Select name="projectId" required>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Loyihani tanlang" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Miqdor * (maks: {maxQuantity} {unit})</Label>
            <AmountInput name="quantity" required className="h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Izoh</Label>
            <Input name="note" placeholder="Izoh" className="h-9" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
          {loading ? "Saqlanmoqda..." : "Ishlatish"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Bekor
        </Button>
      </div>
    </form>
  );
}
