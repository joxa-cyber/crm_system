"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createWorker, updateWorker } from "@/actions/workers";

interface WorkerFormProps {
  worker?: {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string | null;
    phone: string | null;
    position: string;
    monthlySalary: string;
  };
}

export function WorkerForm({ worker }: WorkerFormProps) {
  const action = worker
    ? async (_prev: unknown, formData: FormData) => updateWorker(worker.id, formData)
    : async (_prev: unknown, formData: FormData) => createWorker(formData);

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ism *</Label>
              <Input id="firstName" name="firstName" placeholder="Ism" defaultValue={worker?.firstName} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Familiya *</Label>
              <Input id="lastName" name="lastName" placeholder="Familiya" defaultValue={worker?.lastName} required className="h-11" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Tug'ilgan sana</Label>
              <Input id="birthDate" name="birthDate" type="date" defaultValue={worker?.birthDate || ""} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" placeholder="+998901234567" defaultValue={worker?.phone || ""} className="h-11" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Lavozim *</Label>
              <Input id="position" name="position" placeholder="Masalan: Usta, Yordamchi" defaultValue={worker?.position} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlySalary">Oylik maosh (so'm) *</Label>
              <Input id="monthlySalary" name="monthlySalary" type="number" step="0.01" placeholder="0" defaultValue={worker?.monthlySalary} required className="h-11" />
            </div>
          </div>

          {state?.error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.error}</div>
          )}

          <Button type="submit" disabled={isPending} className="w-full h-11">
            {isPending ? "Saqlanmoqda..." : worker ? "Saqlash" : "Ishchini qo'shish"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
