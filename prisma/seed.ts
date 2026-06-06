import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Start seeding ...");

  const seedUsers = [
    { name: "Alice Roommate", email: "alice@example.com" },
    { name: "Bob Roommate", email: "bob@example.com" },
    { name: "Charlie Friend", email: "charlie@example.com" },
    { name: "David Friend", email: "david@example.com" },
    { name: "Eve Default", email: "eve@example.com" },
  ];

  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
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