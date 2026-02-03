import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // roles (KEEP AS IS)
  await prisma.role.createMany({
    data: [{ name: "ADMIN" }, { name: "DOCTOR" }, { name: "PATIENT" }],
    skipDuplicates: true,
  });

  // 🔹 add admin user
  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@dentaflow.com" },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: "admin@dentaflow.com",
        password: await bcrypt.hash("admin123", 10),
        roleId: adminRole.id,
      },
    });

    console.log("✅ Admin user seeded");
  } else {
    console.log("ℹ️ Admin already exists");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
