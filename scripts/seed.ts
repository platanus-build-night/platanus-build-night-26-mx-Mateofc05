// Seed runner: tsx --env-file=.env scripts/seed.ts
import { seedDatabase } from "@/data/seed";

async function main() {
  console.log("Seeding LineUp database...");
  const counts = await seedDatabase();
  console.log("Seed complete:", counts);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
