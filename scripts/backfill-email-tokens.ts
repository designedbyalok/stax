import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { inboundEmailToken: null },
  });

  console.log(`Found ${users.length} users missing an inbound email token. Backfilling...`);

  let count = 0;
  for (const user of users) {
    // Generate an 8-character token (alphanumeric)
    // nanoid uses URL-friendly characters, we can slice it to 8.
    // To ensure uniqueness, we loop in case of a collision.
    let token = nanoid(8).replace(/[^a-zA-Z0-9]/g, 'a').substring(0, 8);
    
    // Simple retry loop (very rare collisions)
    while (true) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { inboundEmailToken: token },
        });
        count++;
        break;
      } catch (e: any) {
        if (e.code === 'P2002') { // Unique constraint
          token = nanoid(8).replace(/[^a-zA-Z0-9]/g, 'a').substring(0, 8);
        } else {
          throw e;
        }
      }
    }
  }

  console.log(`Backfilled ${count} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
