import { db } from "@/lib/db";
import { ProjectForm } from "@/components/projects/project-form";

export default async function YangiLoyihaPage() {
  const categories = await db.serviceCategory.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Yangi loyiha</h1>
      <ProjectForm categories={categories} />
    </div>
  );
}
