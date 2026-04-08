"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatUZS, formatCurrency, formatDate } from "@/lib/formatters";
import { deleteSalaryPayment } from "@/actions/salary";
import { toast } from "sonner";

interface SalaryRowProps {
  payment: {
    id: string;
    amount: string;
    currency: string;
    amountUzs: string;
    date: Date;
    note: string | null;
    paidBy: { fullName: string };
  };
  canDelete: boolean;
}

export function SalaryRow({ payment, canDelete }: SalaryRowProps) {
  async function handleDelete() {
    if (!confirm("Oylik to'lovni o'chirmoqchimisiz?")) return;
    const result = await deleteSalaryPayment(payment.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("O'chirildi");
    }
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">
          {payment.note || "Oylik"}
        </p>
        <p className="text-xs text-gray-500">
          {formatDate(payment.date)} • {payment.paidBy.fullName}
          {payment.currency !== "UZS" && (
            <> • {formatCurrency(payment.amount, payment.currency)}</>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-green-600">
          {formatUZS(payment.amountUzs)}
        </p>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 h-7 px-2"
            onClick={handleDelete}
          >
            O'chirish
          </Button>
        )}
      </div>
    </div>
  );
}
