"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmountInput } from "@/components/ui/amount-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createProject, updateProject } from "@/actions/projects";

interface ServiceCategory {
  id: string;
  name: string;
}

interface ProjectFormProps {
  categories: ServiceCategory[];
  project?: {
    id: string;
    name: string;
    serviceCategoryId: string;
    clientName: string;
    clientPhone: string;
    clientAddress: string;
    contractAmount: string;
    currency: string;
    startDate: string | null;
    endDate: string | null;
    notes: string | null;
  };
}

export function ProjectForm({ categories, project }: ProjectFormProps) {
  const action = project
    ? async (_prev: unknown, formData: FormData) => {
        return await updateProject(project.id, formData);
      }
    : async (_prev: unknown, formData: FormData) => {
        return await createProject(formData);
      };

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          {/* Loyiha nomi */}
          <div className="space-y-2">
            <Label htmlFor="name">Loyiha nomi *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Masalan: Toshkent, Chilonzor solar panel"
              defaultValue={project?.name}
              required
              className="h-11"
            />
          </div>

          {/* Xizmat turi */}
          <div className="space-y-2">
            <Label>Xizmat turi *</Label>
            <Select
              name="serviceCategoryId"
              defaultValue={project?.serviceCategoryId}
              required
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Xizmat turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mijoz ma'lumotlari */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Mijoz ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Mijoz ismi *</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  placeholder="To'liq ism"
                  defaultValue={project?.clientName}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefon *</Label>
                <Input
                  id="clientPhone"
                  name="clientPhone"
                  placeholder="+998901234567"
                  defaultValue={project?.clientPhone}
                  required
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="clientAddress">Manzil *</Label>
              <Input
                id="clientAddress"
                name="clientAddress"
                placeholder="Shahar, tuman, ko'cha, uy"
                defaultValue={project?.clientAddress}
                required
                className="h-11"
              />
            </div>
          </div>

          {/* Shartnoma */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Shartnoma
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractAmount">Shartnoma summasi *</Label>
                <AmountInput
                  id="contractAmount"
                  name="contractAmount"
                  defaultValue={project?.contractAmount}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Valyuta *</Label>
                <Select name="currency" defaultValue={project?.currency || "UZS"}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UZS">UZS (so'm)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="RUB">RUB (₽)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sanalar */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Sanalar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Boshlanish sanasi</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={project?.startDate || ""}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tugash sanasi</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={project?.endDate || ""}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Izoh */}
          <div className="space-y-2">
            <Label htmlFor="notes">Izoh</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Qo'shimcha ma'lumotlar..."
              defaultValue={project?.notes || ""}
              rows={3}
            />
          </div>

          {/* Error */}
          {state?.error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {state.error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1 h-11">
              {isPending
                ? "Saqlanmoqda..."
                : project
                ? "Saqlash"
                : "Loyihani yaratish"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
