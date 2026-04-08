"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { convertToUzs } from "@/lib/cbu";
import { expenseSchema } from "@/lib/validators";

export async function createExpense(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const raw = {
    projectId: formData.get("projectId") as string,
    category: formData.get("category") as string,
    amount: formData.get("amount") as string,
    currency: formData.get("currency") as string,
    date: formData.get("date") as string,
    description: formData.get("description") as string,
  };

  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const amount = parseFloat(parsed.data.amount);
  const amountUzs = await convertToUzs(amount, parsed.data.currency);

  await db.expense.create({
    data: {
      projectId: parsed.data.projectId,
      category: parsed.data.category as "MATERIALLAR" | "ISHHAQI" | "TRANSPORT" | "OVQAT" | "ASBOB_USKUNALAR" | "BOSHQA",
      amount,
      currency: parsed.data.currency as "UZS" | "USD" | "EUR" | "RUB",
      amountUzs,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      description: parsed.data.description,
      addedById: session.user.id,
    },
  });

  revalidatePath(`/loyihalar/${parsed.data.projectId}`);
  revalidatePath("/harajatlar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateExpense(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const expense = await db.expense.findUnique({ where: { id } });
  if (!expense) throw new Error("Harajat topilmadi");

  // Menejer faqat o'z harajatini o'zgartira oladi
  if (session.user.role !== "ADMIN" && expense.addedById !== session.user.id) {
    return { error: "Siz faqat o'z harajatingizni o'zgartira olasiz" };
  }

  const amount = parseFloat(formData.get("amount") as string);
  const currency = formData.get("currency") as string;
  const amountUzs = await convertToUzs(amount, currency);

  await db.expense.update({
    where: { id },
    data: {
      category: formData.get("category") as "MATERIALLAR" | "ISHHAQI" | "TRANSPORT" | "OVQAT" | "ASBOB_USKUNALAR" | "BOSHQA",
      amount,
      currency: currency as "UZS" | "USD" | "EUR" | "RUB",
      amountUzs,
      date: formData.get("date") ? new Date(formData.get("date") as string) : expense.date,
      description: formData.get("description") as string,
    },
  });

  revalidatePath(`/loyihalar/${expense.projectId}`);
  revalidatePath("/harajatlar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const expense = await db.expense.findUnique({ where: { id } });
  if (!expense) throw new Error("Harajat topilmadi");

  if (session.user.role !== "ADMIN") {
    return { error: "Faqat CEO harajatni o'chira oladi" };
  }

  await db.expense.delete({ where: { id } });

  revalidatePath(`/loyihalar/${expense.projectId}`);
  revalidatePath("/harajatlar");
  revalidatePath("/dashboard");
  return { success: true };
}
