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

  const arrivedDate = formData.get("arrivedDate") as string;

  await db.inventoryItem.create({
    data: {
      name: parsed.data.name,
      unit: parsed.data.unit,
      quantity: parseFloat(parsed.data.quantity),
      unitPrice: parseFloat(parsed.data.unitPrice),
      currency: parsed.data.currency as "UZS" | "USD" | "EUR" | "RUB",
      minQuantity: parsed.data.minQuantity ? parseFloat(parsed.data.minQuantity) : null,
      createdAt: arrivedDate ? new Date(arrivedDate) : new Date(),
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

export async function restockInventoryItem(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Ruxsat yo'q" };

  const inventoryItemId = formData.get("inventoryItemId") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const unitPrice = parseFloat(formData.get("unitPrice") as string);
  const currency = formData.get("currency") as string;
  const supplierId = formData.get("supplierId") as string;
  const date = formData.get("date") as string;
  const note = formData.get("note") as string;

  if (!inventoryItemId || isNaN(quantity) || quantity <= 0) {
    return { error: "Ma'lumotlar noto'g'ri" };
  }

  await db.$transaction([
    db.inventoryRestock.create({
      data: {
        inventoryItemId,
        quantity,
        unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
        currency: (currency || "UZS") as "UZS" | "USD" | "EUR" | "RUB",
        supplierId: supplierId || null,
        date: date ? new Date(date) : new Date(),
        note: note || null,
      },
    }),
    db.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { quantity: { increment: quantity } },
    }),
  ]);

  revalidatePath("/ombor");
  return { success: true };
}

export async function returnMaterial(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Ruxsat yo'q" };

  const usageId = formData.get("usageId") as string;
  const returnQty = parseFloat(formData.get("returnQty") as string);

  if (!usageId || isNaN(returnQty) || returnQty <= 0) {
    return { error: "Ma'lumotlar noto'g'ri" };
  }

  const usage = await db.materialUsage.findUnique({
    where: { id: usageId },
    include: { inventoryItem: true },
  });
  if (!usage) return { error: "Topilmadi" };

  const maxReturn = Number(usage.quantity) - Number(usage.returnedQty);
  if (returnQty > maxReturn) {
    return { error: `Maksimum qaytarish: ${maxReturn} ${usage.inventoryItem.unit}` };
  }

  await db.$transaction([
    db.materialUsage.update({
      where: { id: usageId },
      data: { returnedQty: { increment: returnQty } },
    }),
    db.inventoryItem.update({
      where: { id: usage.inventoryItemId },
      data: { quantity: { increment: returnQty } },
    }),
  ]);

  revalidatePath("/ombor");
  revalidatePath(`/loyihalar/${usage.projectId}`);
  return { success: true };
}

// Supplier actions
export async function createSupplier(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Ruxsat yo'q" };

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const notes = formData.get("notes") as string;

  if (!name) return { error: "Nomini kiriting" };

  await db.supplier.create({
    data: {
      name,
      phone: phone || null,
      address: address || null,
      notes: notes || null,
    },
  });

  revalidatePath("/ombor");
  return { success: true };
}

export async function deleteSupplier(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Faqat CEO o'chira oladi" };
  }

  await db.supplier.delete({ where: { id } });
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
