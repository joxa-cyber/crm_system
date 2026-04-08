"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { userSchema } from "@/lib/validators";

export async function createManager(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Faqat CEO menejer qo'sha oladi" };
  }

  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    fullName: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
  };

  const parsed = userSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Bu email allaqachon mavjud" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      fullName: parsed.data.fullName,
      role: "MANAGER",
      phone: parsed.data.phone || null,
    },
  });

  revalidatePath("/sozlamalar");
  return { success: true };
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Faqat CEO o'chira oladi" };
  }

  if (id === session.user.id) {
    return { error: "O'zingizni o'chira olmaysiz" };
  }

  await db.user.delete({ where: { id } });
  revalidatePath("/sozlamalar");
  return { success: true };
}
