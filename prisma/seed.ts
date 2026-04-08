import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // CEO akkaunt yaratish
  const passwordHash = await bcrypt.hash("solarix.uz", 10);

  await prisma.user.upsert({
    where: { email: "solarix.uz" },
    update: {},
    create: {
      email: "solarix.uz",
      passwordHash,
      fullName: "Solarix CEO",
      role: "ADMIN",
      phone: "+998901234567",
    },
  });

  // Xizmat turlari
  const categories = [
    "Quyosh panel",
    "Santexnika",
    "Issiqlik nasosi",
    "Isitish/sovutish",
    "Elektr montaj",
    "Boshqa",
  ];

  for (const name of categories) {
    await prisma.serviceCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seed tugadi! CEO login: solarix.uz / parol: solarix.uz");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
