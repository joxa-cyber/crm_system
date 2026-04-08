import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Login kiriting"),
  password: z.string().min(1, "Parol kiriting"),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Loyiha nomini kiriting"),
  serviceCategoryId: z.string().min(1, "Xizmat turini tanlang"),
  clientName: z.string().min(1, "Mijoz ismini kiriting"),
  clientPhone: z.string().min(1, "Telefon raqamini kiriting"),
  clientAddress: z.string().min(1, "Manzilni kiriting"),
  contractAmount: z.string().min(1, "Shartnoma summasini kiriting"),
  currency: z.enum(["UZS", "USD", "EUR", "RUB"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export const expenseSchema = z.object({
  projectId: z.string().min(1, "Loyihani tanlang"),
  category: z.enum(["MATERIALLAR", "ISHHAQI", "TRANSPORT", "OVQAT", "ASBOB_USKUNALAR", "BOSHQA"]),
  amount: z.string().min(1, "Summani kiriting"),
  currency: z.enum(["UZS", "USD", "EUR", "RUB"]),
  date: z.string().optional(),
  description: z.string().min(1, "Izoh kiriting"),
});

export const paymentSchema = z.object({
  projectId: z.string().min(1, "Loyihani tanlang"),
  amount: z.string().min(1, "Summani kiriting"),
  currency: z.enum(["UZS", "USD", "EUR", "RUB"]),
  date: z.string().optional(),
  note: z.string().optional(),
});

export const workerSchema = z.object({
  firstName: z.string().min(1, "Ismni kiriting"),
  lastName: z.string().min(1, "Familiyani kiriting"),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().min(1, "Lavozimni kiriting"),
  monthlySalary: z.string().min(1, "Oylik maoshni kiriting"),
});

export const salaryPaymentSchema = z.object({
  workerId: z.string().min(1, "Ishchini tanlang"),
  amount: z.string().min(1, "Summani kiriting"),
  currency: z.enum(["UZS", "USD", "EUR", "RUB"]),
  date: z.string().optional(),
  note: z.string().optional(),
});

export const inventorySchema = z.object({
  name: z.string().min(1, "Nomini kiriting"),
  unit: z.string().min(1, "Birlikni kiriting"),
  quantity: z.string().min(1, "Miqdorni kiriting"),
  unitPrice: z.string().min(1, "Narxni kiriting"),
  currency: z.enum(["UZS", "USD", "EUR", "RUB"]),
  minQuantity: z.string().optional(),
});

export const userSchema = z.object({
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 belgi bo'lishi kerak"),
  fullName: z.string().min(1, "Ism kiriting"),
  phone: z.string().optional(),
});
