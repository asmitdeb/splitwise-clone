import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Start seeding ...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const seedUsers = [
    { name: "Alice Roommate", email: "alice@example.com", password: hashedPassword },
    { name: "Bob Roommate", email: "bob@example.com", password: hashedPassword },
    { name: "Charlie Friend", email: "charlie@example.com", password: hashedPassword },
    { name: "David Friend", email: "david@example.com", password: hashedPassword },
    { name: "Eve Default", email: "eve@example.com", password: hashedPassword },
  ];

  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: u.password },
      create: u,
    });

    console.log(`Ensured user exists: ${user.name} (${user.id})`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });