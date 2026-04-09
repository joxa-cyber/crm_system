import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EstimateCreateForm } from "@/components/estimates/estimate-create-form";

export default async function YangiSmetaPage() {
  const session = await auth();
  if (!session?.user) return null;

  const projects = await db.project.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, clientName: true, clientPhone: true, clientAddress: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Yangi smeta</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Smeta ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <EstimateCreateForm projects={projects} />
        </CardContent>
      </Card>
    </div>
  );
}
