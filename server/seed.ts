import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const adminEmail = "admin@storerating.com";
  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail));

  if (existingAdmin.length === 0) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    await db.insert(users).values({
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      address: "123 Admin Street, System City, SC 12345",
      role: "admin",
    });
    console.log("✓ Admin user created:");
    console.log("  Email: admin@storerating.com");
    console.log("  Password: Admin@123");
  } else {
    console.log("✓ Admin user already exists");
  }

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
