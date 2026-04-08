"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatUZS, formatCurrency, formatDate, EXPENSE_CATEGORY_LABELS } from "@/lib/formatters";
import { deleteExpense } from "@/actions/expenses";
import { toast } from "sonner";

interface ExpenseRowProps {
  expense: {
    id: string;
    category: string;
    amount: string;
    currency: string;
    amountUzs: string;
    date: Date;
    description: string;
    addedBy: { fullName: string; id: string };
  };
  canEdit: boolean;
  canDelete: boolean;
}

export function ExpenseRow({ expense, canEdit, canDelete }: ExpenseRowProps) {
  async function handleDelete() {
    if (!confirm("Harajatni o'chirmoqchimisiz?")) return;
    const result = await deleteExpense(expense.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Harajat o'chirildi");
    }
  }

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                {EXPENSE_CATEGORY_LABELS[expense.category]}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(expense.date)}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">
              {expense.description}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {expense.addedBy.fullName}
              {expense.currency !== "UZS" && (
                <> • {formatCurrency(expense.amount, expense.currency)}</>
              )}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-red-600">
              {formatUZS(expense.amountUzs)}
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
