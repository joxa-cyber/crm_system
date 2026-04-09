"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteEstimate, duplicateEstimate, updateEstimateStatus } from "@/actions/estimates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function EstimateStatusSelect({ estimateId, currentStatus }: { estimateId: string; currentStatus: string }) {
  const labels: Record<string, string> = {
    QORALAMA: "Qoralama",
    YUBORILGAN: "Yuborilgan",
    TASDIQLANGAN: "Tasdiqlangan",
    BEKOR: "Bekor",
  };

  return (
    <Select defaultValue={currentStatus} onValueChange={(value) => {
      if (value) updateEstimateStatus(estimateId, value);
    }}>
      <SelectTrigger className="h-9 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(labels).map(([val, label]) => (
          <SelectItem key={val} value={val}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DuplicateEstimateButton({ estimateId }: { estimateId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDuplicate() {
    setLoading(true);
    try {
      await duplicateEstimate(estimateId);
    } catch {
      toast.error("Xatolik yuz berdi");
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={loading}>
      {loading ? "Nusxalanmoqda..." : "Nusxalash"}
    </Button>
  );
}

export function DeleteEstimateButton({ estimateId }: { estimateId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!confirming) {
    return (
      <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
        O'chirish
      </Button>
    );
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const result = await deleteEstimate(estimateId);
      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
        setConfirming(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
        {loading ? "..." : "Tasdiqlash"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Bekor</Button>
    </div>
  );
}

export function PrintEstimateButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      Chop etish
    </Button>
  );
}
