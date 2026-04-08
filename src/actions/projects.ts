"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { convertToUzs } from "@/lib/cbu";
import { projectSchema } from "@/lib/validators";

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const raw = {
    name: formData.get("name") as string,
    serviceCategoryId: formData.get("serviceCategoryId") as string,
    clientName: formData.get("clientName") as string,
    clientPhone: formData.get("clientPhone") as string,
    clientAddress: formData.get("clientAddress") as string,
    contractAmount: formData.get("contractAmount") as string,
    currency: formData.get("currency") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    notes: formData.get("notes") as string,
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const amount = parseFloat(parsed.data.contractAmount);
  const amountUzs = await convertToUzs(amount, parsed.data.currency);

  const project = await db.project.create({
    data: {
      name: parsed.data.name,
      serviceCategoryId: parsed.data.serviceCategoryId,
      clientName: parsed.data.clientName,
      clientPhone: parsed.data.clientPhone,
      clientAddress: parsed.data.clientAddress,
      contractAmount: amount,
      currency: parsed.data.currency as "UZS" | "USD" | "EUR" | "RUB",
      contractAmountUzs: amountUzs,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      notes: parsed.data.notes || null,
      createdById: session.user.id,
    },
  });

  revalidatePath("/loyihalar");
  revalidatePath("/dashboard");
  redirect(`/loyihalar/${project.id}`);
}

export async function updateProject(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const raw = {
    name: formData.get("name") as string,
    serviceCategoryId: formData.get("serviceCategoryId") as string,
    clientName: formData.get("clientName") as string,
    clientPhone: formData.get("clientPhone") as string,
    clientAddress: formData.get("clientAddress") as string,
    contractAmount: formData.get("contractAmount") as string,
    currency: formData.get("currency") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    notes: formData.get("notes") as string,
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const amount = parseFloat(parsed.data.contractAmount);
  const amountUzs = await convertToUzs(amount, parsed.data.currency);

  await db.project.update({
    where: { id },
    data: {
      name: parsed.data.name,
      serviceCategoryId: parsed.data.serviceCategoryId,
      clientName: parsed.data.clientName,
      clientPhone: parsed.data.clientPhone,
      clientAddress: parsed.data.clientAddress,
      contractAmount: amount,
      currency: parsed.data.currency as "UZS" | "USD" | "EUR" | "RUB",
      contractAmountUzs: amountUzs,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/loyihalar");
  revalidatePath(`/loyihalar/${id}`);
  revalidatePath("/dashboard");
  redirect(`/loyihalar/${id}`);
}

export async function updateProjectStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  await db.project.update({
    where: { id },
    data: { status: status as "YANGI" | "JARAYONDA" | "TUGALLANGAN" | "BEKOR" },
  });

  revalidatePath("/loyihalar");
  revalidatePath(`/loyihalar/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteProject(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Faqat CEO o'chira oladi");
  }

  await db.project.delete({ where: { id } });

  revalidatePath("/loyihalar");
  revalidatePath("/dashboard");
  redirect("/loyihalar");
}
