"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteUser } from "@/actions/users";
import { toast } from "sonner";

export function DeleteManagerButton({ userId }: { userId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!confirming) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setConfirming(true)}
      >
        O'chirish
      </Button>
    );
  }

  async function handleDelete() {
    setLoading(true);
    const result = await deleteUser(userId);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
      setConfirming(false);
    } else {
      toast.success("Menejer o'chirildi");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? "O'chirilmoqda..." : "Tasdiqlash"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(false)}
      >
        Bekor
      </Button>
    </div>
  );
}
