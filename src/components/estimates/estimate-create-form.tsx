"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEstimate } from "@/actions/estimates";

interface Project {
  id: string;
  name: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
}

export function EstimateCreateForm({ projects }: { projects: Project[] }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleProjectChange(projectId: string | null) {
    const proj = projectId ? projects.find((p) => p.id === projectId) : null;
    setSelectedProject(proj || null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createEstimate(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Smeta nomi *</Label>
        <Input name="name" placeholder="Masalan: Toshkent Chilonzor 30kw solar" required className="h-11" />
      </div>

      <div className="space-y-2">
        <Label>Loyihaga bog'lash (ixtiyoriy)</Label>
        <Select name="projectId" onValueChange={handleProjectChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Loyihani tanlang (ixtiyoriy)" />
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

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Mijoz ma'lumotlari</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Mijoz ismi *</Label>
            <Input
              name="clientName"
              placeholder="To'liq ism"
              defaultValue={selectedProject?.clientName || ""}
              key={selectedProject?.id || "none"}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input
              name="clientPhone"
              placeholder="+998901234567"
              defaultValue={selectedProject?.clientPhone || ""}
              key={(selectedProject?.id || "none") + "-phone"}
              className="h-11"
            />
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <Label>Manzil</Label>
          <Input
            name="clientAddress"
            placeholder="Manzil"
            defaultValue={selectedProject?.clientAddress || ""}
            key={(selectedProject?.id || "none") + "-addr"}
            className="h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Izoh</Label>
        <Input name="notes" placeholder="Qo'shimcha ma'lumot" className="h-11" />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
      )}

      <Button type="submit" disabled={loading} className="w-full h-11">
        {loading ? "Yaratilmoqda..." : "Smeta yaratish"}
      </Button>
    </form>
  );
}
