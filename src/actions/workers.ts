"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { workerSchema } from "@/lib/validators";

export async function createWorker(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    birthDate: formData.get("birthDate") as string,
    phone: formData.get("phone") as string,
    position: formData.get("position") as string,
    monthlySalary: formData.get("monthlySalary") as string,
  };

  const parsed = workerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const worker = await db.worker.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null,
      phone: parsed.data.phone || null,
      position: parsed.data.position,
      monthlySalary: parseFloat(parsed.data.monthlySalary),
    },
  });

  revalidatePath("/ishchilar");
  redirect(`/ishchilar/${worker.id}`);
}

export async function updateWorker(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    birthDate: formData.get("birthDate") as string,
    phone: formData.get("phone") as string,
    position: formData.get("position") as string,
    monthlySalary: formData.get("monthlySalary") as string,
  };

  const parsed = workerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.worker.update({
    where: { id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null,
      phone: parsed.data.phone || null,
      position: parsed.data.position,
      monthlySalary: parseFloat(parsed.data.monthlySalary),
    },
  });

  revalidatePath("/ishchilar");
  revalidatePath(`/ishchilar/${id}`);
  redirect(`/ishchilar/${id}`);
}

export async function deleteWorker(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Faqat CEO o'chira oladi" };
  }

  // O'chirish oldidan bog'liq ma'lumotlarni tekshirish
  const worker = await db.worker.findUnique({
    where: { id },
    include: {
      _count: { select: { salaryPayments: true, assignments: true } },
    },
  });
  if (!worker) return { error: "Ishchi topilmadi" };

  // Bog'liq ma'lumotlarni o'chirish
  await db.salaryPayment.deleteMany({ where: { workerId: id } });
  await db.workerAssignment.deleteMany({ where: { workerId: id } });
  await db.worker.delete({ where: { id } });

  revalidatePath("/ishchilar");
  redirect("/ishchilar");
}

export async function toggleWorkerActive(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const worker = await db.worker.findUnique({ where: { id } });
  if (!worker) throw new Error("Ishchi topilmadi");

  await db.worker.update({
    where: { id },
    data: { isActive: !worker.isActive },
  });

  revalidatePath("/ishchilar");
  revalidatePath(`/ishchilar/${id}`);
}
