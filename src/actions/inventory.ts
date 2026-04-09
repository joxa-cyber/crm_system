"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { inventorySchema } from "@/lib/validators";

export async function createInventoryItem(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const raw = {
    name: formData.get("name") as string,
    unit: formData.get("unit") as string,
    quantity: formData.get("quantity") as string,
    unitPrice: formData.get("unitPrice") as string,
    currency: formData.get("currency") as string,
    minQuantity: formData.get("minQuantity") as string,
  };

  const parsed = inventorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db.inventoryItem.create({
    data: {
      name: parsed.data.name,
      unit: parsed.data.unit,
      quantity: parseFloat(parsed.data.quantity),
      unitPrice: parseFloat(parsed.data.unitPrice),
      currency: parsed.data.currency as "UZS" | "USD" | "EUR" | "RUB",
      minQuantity: parsed.data.minQuantity ? parseFloat(parsed.data.minQuantity) : null,
    },
  });

  revalidatePath("/ombor");
  return { success: true };
}

export async function updateInventoryItem(id: string, formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Ruxsat yo'q" };

  await db.inventoryItem.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      unit: formData.get("unit") as string,
      quantity: parseFloat(formData.get("quantity") as string),
      unitPrice: parseFloat(formData.get("unitPrice") as string),
      currency: (formData.get("currency") as string) as "UZS" | "USD" | "EUR" | "RUB",
      minQuantity: formData.get("minQuantity") ? parseFloat(formData.get("minQuantity") as string) : null,
    },
  });

  revalidatePath("/ombor");
  return { success: true };
}

export async function deleteInventoryItem(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Faqat CEO o'chira oladi" };
  }

  await db.inventoryItem.delete({ where: { id } });
  revalidatePath("/ombor");
  return { success: true };
}

export async function useMaterial(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const inventoryItemId = formData.get("inventoryItemId") as string;
  const projectId = formData.get("projectId") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const date = formData.get("date") as string;
  const note = formData.get("note") as string;

  if (!inventoryItemId || !projectId || isNaN(quantity) || quantity <= 0) {
    return { error: "Ma'lumotlar noto'g'ri" };
  }

  const item = await db.inventoryItem.findUnique({ where: { id: inventoryItemId } });
  if (!item) return { error: "Material topilmadi" };

  if (Number(item.quantity) < quantity) {
    return { error: `Omborda yetarli emas. Mavjud: ${item.quantity} ${item.unit}` };
  }

  await db.$transaction([
    db.materialUsage.create({
      data: {
        inventoryItemId,
        projectId,
        quantity,
        date: date ? new Date(date) : new Date(),
        note: note || null,
      },
    }),
    db.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { quantity: { decrement: quantity } },
    }),
  ]);

  revalidatePath("/ombor");
  revalidatePath(`/loyihalar/${projectId}`);
  return { success: true };
}
