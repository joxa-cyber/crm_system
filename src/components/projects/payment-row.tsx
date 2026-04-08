"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatUZS, formatCurrency, formatDate } from "@/lib/formatters";
import { deletePayment } from "@/actions/payments";
import { toast } from "sonner";

interface PaymentRowProps {
  payment: {
    id: string;
    amount: string;
    currency: string;
    amountUzs: string;
    date: Date;
    note: string | null;
    recordedBy: { fullName: string };
  };
  canDelete: boolean;
}

export function PaymentRow({ payment, canDelete }: PaymentRowProps) {
  async function handleDelete() {
    if (!confirm("To'lovni o'chirmoqchimisiz?")) return;
    const result = await deletePayment(payment.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("To'lov o'chirildi");
    }
  }

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {payment.note || "To'lov"}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(payment.date)} • {payment.recordedBy.fullName}
              {payment.currency !== "UZS" && (
                <> • {formatCurrency(payment.amount, payment.currency)}</>
              )}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-green-600">
              +{formatUZS(payment.amountUzs)}
            </p>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 h-7 px-2 mt-1"
                onClick={handleDelete}
              >
                O'chirish
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
