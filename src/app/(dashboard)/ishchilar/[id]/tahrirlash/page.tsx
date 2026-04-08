import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { WorkerForm } from "@/components/workers/worker-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TahrirlashIshchiPage({ params }: Props) {
  const { id } = await params;
  const worker = await db.worker.findUnique({ where: { id } });
  if (!worker) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ishchini tahrirlash</h1>
      <WorkerForm
        worker={{
          id: worker.id,
          firstName: worker.firstName,
          lastName: worker.lastName,
          birthDate: worker.birthDate?.toISOString().split("T")[0] || null,
          phone: worker.phone,
          position: worker.position,
          monthlySalary: String(worker.monthlySalary),
        }}
      />
    </div>
  );
}
