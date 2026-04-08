"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { convertToUzs } from "@/lib/cbu";

export async function createPayment(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const projectId = formData.get("projectId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currency = formData.get("currency") as string;
  const date = formData.get("date") as string;
  const note = formData.get("note") as string;

  if (!projectId || isNaN(amount) || amount <= 0) {
    return { error: "Ma'lumotlar noto'g'ri" };
  }

  const amountUzs = await convertToUzs(amount, currency);

  await db.projectPayment.create({
    data: {
      projectId,
      amount,
      currency: currency as "UZS" | "USD" | "EUR" | "RUB",
      amountUzs,
      date: date ? new Date(date) : new Date(),
      note: note || null,
      recordedById: session.user.id,
    },
  });

  revalidatePath(`/loyihalar/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deletePayment(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Faqat CEO o'chira oladi" };
  }

  const payment = await db.projectPayment.findUnique({ where: { id } });
  if (!payment) return { error: "To'lov topilmadi" };

  await db.projectPayment.delete({ where: { id } });

  revalidatePath(`/loyihalar/${payment.projectId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
