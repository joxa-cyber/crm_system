"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEstimate(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const name = formData.get("name") as string;
  const projectId = formData.get("projectId") as string;
  const clientName = formData.get("clientName") as string;
  const clientPhone = formData.get("clientPhone") as string;
  const clientAddress = formData.get("clientAddress") as string;
  const notes = formData.get("notes") as string;

  if (!name || !clientName) {
    return { error: "Nom va mijoz ismini kiriting" };
  }

  const estimate = await db.estimate.create({
    data: {
      name,
      projectId: projectId || null,
      clientName,
      clientPhone: clientPhone || null,
      clientAddress: clientAddress || null,
      notes: notes || null,
      createdById: session.user.id,
    },
  });

  revalidatePath("/smeta");
  redirect(`/smeta/${estimate.id}`);
}

export async function updateEstimate(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const name = formData.get("name") as string;
  const clientName = formData.get("clientName") as string;
  const clientPhone = formData.get("clientPhone") as string;
  const clientAddress = formData.get("clientAddress") as string;
  const notes = formData.get("notes") as string;

  await db.estimate.update({
    where: { id },
    data: {
      name,
      clientName,
      clientPhone: clientPhone || null,
      clientAddress: clientAddress || null,
      notes: notes || null,
    },
  });

  revalidatePath(`/smeta/${id}`);
  revalidatePath("/smeta");
  return { success: true };
}

export async function updateEstimateStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  await db.estimate.update({
    where: { id },
    data: { status: status as "QORALAMA" | "YUBORILGAN" | "TASDIQLANGAN" | "BEKOR" },
  });

  revalidatePath(`/smeta/${id}`);
  revalidatePath("/smeta");
}

export async function deleteEstimate(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Faqat CEO o'chira oladi" };
  }

  await db.estimate.delete({ where: { id } });
  revalidatePath("/smeta");
  redirect("/smeta");
}

export async function addEstimateItem(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const estimateId = formData.get("estimateId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const unit = formData.get("unit") as string;
  const currency = (formData.get("currency") as string) || "USD";

  // Watt hisoblash
  const wattPerUnit = formData.get("wattPerUnit") as string;
  const pricePerWatt = formData.get("pricePerWatt") as string;
  const unitPrice = parseFloat(formData.get("unitPrice") as string);

  if (!estimateId || !name || isNaN(quantity) || quantity <= 0) {
    return { error: "Ma'lumotlar noto'g'ri" };
  }

  let finalPrice = unitPrice;
  let totalAmount: number;
  const wattVal = wattPerUnit ? parseFloat(wattPerUnit) : null;
  const ppwVal = pricePerWatt ? parseFloat(pricePerWatt) : null;

  if (wattVal && ppwVal) {
    // Panel hisoblash: quantity * wattPerUnit * pricePerWatt
    finalPrice = wattVal * ppwVal;
    totalAmount = quantity * finalPrice;
  } else if (!isNaN(unitPrice)) {
    totalAmount = quantity * unitPrice;
  } else {
    return { error: "Narxni kiriting" };
  }

  // Get max sort order
  const maxItem = await db.estimateItem.findFirst({
    where: { estimateId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const sortOrder = (maxItem?.sortOrder ?? -1) + 1;

  await db.estimateItem.create({
    data: {
      estimateId,
      sortOrder,
      name,
      description: description || null,
      quantity,
      unit: unit || "dona",
      unitPrice: finalPrice,
      currency: currency as "UZS" | "USD" | "EUR" | "RUB",
      wattPerUnit: wattVal,
      pricePerWatt: ppwVal,
      totalAmount,
    },
  });

  revalidatePath(`/smeta/${estimateId}`);
  return { success: true };
}

export async function updateEstimateItem(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const name = formData.get("name") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const unit = formData.get("unit") as string;
  const unitPrice = parseFloat(formData.get("unitPrice") as string);
  const currency = (formData.get("currency") as string) || "USD";
  const wattPerUnit = formData.get("wattPerUnit") as string;
  const pricePerWatt = formData.get("pricePerWatt") as string;

  const wattVal = wattPerUnit ? parseFloat(wattPerUnit) : null;
  const ppwVal = pricePerWatt ? parseFloat(pricePerWatt) : null;

  let finalPrice = unitPrice;
  let totalAmount: number;

  if (wattVal && ppwVal) {
    finalPrice = wattVal * ppwVal;
    totalAmount = quantity * finalPrice;
  } else {
    totalAmount = quantity * unitPrice;
  }

  const item = await db.estimateItem.update({
    where: { id },
    data: {
      name,
      quantity,
      unit,
      unitPrice: finalPrice,
      currency: currency as "UZS" | "USD" | "EUR" | "RUB",
      wattPerUnit: wattVal,
      pricePerWatt: ppwVal,
      totalAmount,
    },
  });

  revalidatePath(`/smeta/${item.estimateId}`);
  return { success: true };
}

export async function deleteEstimateItem(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const item = await db.estimateItem.findUnique({ where: { id } });
  if (!item) return { error: "Topilmadi" };

  await db.estimateItem.delete({ where: { id } });
  revalidatePath(`/smeta/${item.estimateId}`);
  return { success: true };
}

export async function addEstimatePayment(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const estimateId = formData.get("estimateId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currency = (formData.get("currency") as string) || "UZS";
  const date = formData.get("date") as string;
  const note = formData.get("note") as string;

  if (!estimateId || isNaN(amount) || amount <= 0) {
    return { error: "Summani kiriting" };
  }

  await db.estimatePayment.create({
    data: {
      estimateId,
      amount,
      currency: currency as "UZS" | "USD" | "EUR" | "RUB",
      date: date ? new Date(date) : new Date(),
      note: note || null,
    },
  });

  revalidatePath(`/smeta/${estimateId}`);
  return { success: true };
}

export async function deleteEstimatePayment(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const payment = await db.estimatePayment.findUnique({ where: { id } });
  if (!payment) return { error: "Topilmadi" };

  await db.estimatePayment.delete({ where: { id } });
  revalidatePath(`/smeta/${payment.estimateId}`);
  return { success: true };
}

export async function duplicateEstimate(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Ruxsat yo'q");

  const original = await db.estimate.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!original) return { error: "Smeta topilmadi" };

  const copy = await db.estimate.create({
    data: {
      name: original.name + " (nusxa)",
      clientName: original.clientName,
      clientPhone: original.clientPhone,
      clientAddress: original.clientAddress,
      notes: original.notes,
      createdById: session.user.id,
      items: {
        create: original.items.map((item) => ({
          sortOrder: item.sortOrder,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          currency: item.currency,
          wattPerUnit: item.wattPerUnit,
          pricePerWatt: item.pricePerWatt,
          totalAmount: item.totalAmount,
        })),
      },
    },
  });

  revalidatePath("/smeta");
  redirect(`/smeta/${copy.id}`);
}
