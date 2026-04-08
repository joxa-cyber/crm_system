"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { fetchAndCacheRates } from "@/lib/cbu";

export async function createServiceCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Faqat CEO qo'sha oladi" };
  }

  const name = formData.get("name") as string;
  if (!name) return { error: "Nomini kiriting" };

  const existing = await db.serviceCategory.findUnique({ where: { name } });
  if (existing) return { error: "Bu tur allaqachon mavjud" };

  await db.serviceCategory.create({ data: { name } });
  revalidatePath("/sozlamalar");
  return { success: true };
}

export async function deleteServiceCategory(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Faqat CEO o'chira oladi" };
  }

  const projects = await db.project.count({ where: { serviceCategoryId: id } });
  if (projects > 0) {
    return { error: `Bu turga ${projects} ta loyiha biriktirilgan. Avval loyihalarni boshqa turga o'tkazing` };
  }

  await db.serviceCategory.delete({ where: { id } });
  revalidatePath("/sozlamalar");
  return { success: true };
}

export async function refreshExchangeRates() {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  try {
    await fetchAndCacheRates();
    revalidatePath("/sozlamalar");
    return { success: true };
  } catch {
    return { error: "Valyuta kurslarini yangilashda xatolik" };
  }
}
