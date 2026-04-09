"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteEstimatePayment } from "@/actions/estimates";
import { toast } from "sonner";

export function DeletePaymentButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteEstimatePayment(paymentId);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "..." : "×"}
    </Button>
  );
}
