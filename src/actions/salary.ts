"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { convertToUzs } from "@/lib/cbu";

export async function createSalaryPayment(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const workerId = formData.get("workerId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currency = (formData.get("currency") as string) || "UZS";
  const date = formData.get("date") as string;
  const note = formData.get("note") as string;

  if (!workerId || isNaN(amount) || amount <= 0) {
    return { error: "Ma'lumotlar noto'g'ri" };
  }

  const amountUzs = await convertToUzs(amount, currency);

  await db.salaryPayment.create({
    data: {
      workerId,
      amount,
      currency: currency as "UZS" | "USD" | "EUR" | "RUB",
      amountUzs,
      date: date ? new Date(date) : new Date(),
      note: note || null,
      paidById: session.user.id,
    },
  });

  revalidatePath(`/ishchilar/${workerId}`);
  revalidatePath("/oyliklar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSalaryPayment(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Faqat CEO o'chira oladi" };
  }

  const payment = await db.salaryPayment.findUnique({ where: { id } });
  if (!payment) return { error: "To'lov topilmadi" };

  await db.salaryPayment.delete({ where: { id } });

  revalidatePath(`/ishchilar/${payment.workerId}`);
  revalidatePath("/oyliklar");
  revalidatePath("/dashboard");
  return { success: true };
}
