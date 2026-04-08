import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { ProjectForm } from "@/components/projects/project-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TahrirlashPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/loyihalar");

  const project = await db.project.findUnique({ where: { id } });
  if (!project) notFound();

  const categories = await db.serviceCategory.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Loyihani tahrirlash</h1>
      <ProjectForm
        categories={categories}
        project={{
          id: project.id,
          name: project.name,
          serviceCategoryId: project.serviceCategoryId,
          clientName: project.clientName,
          clientPhone: project.clientPhone,
          clientAddress: project.clientAddress,
          contractAmount: String(project.contractAmount),
          currency: project.currency,
          startDate: project.startDate?.toISOString().split("T")[0] || null,
          endDate: project.endDate?.toISOString().split("T")[0] || null,
          notes: project.notes,
        }}
      />
    </div>
  );
}
