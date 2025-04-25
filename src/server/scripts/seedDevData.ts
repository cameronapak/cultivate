import type { PrismaClient } from '@prisma/client'
import type { DbSeedFn } from 'wasp/server' // Import Wasp's seed function type

/**
 * Seeds a specific invite code if it doesn't exist.
 * Requires at least one user to exist in the database.
 */
export const seedDevInviteCode: DbSeedFn = async (prisma: PrismaClient): Promise<void> => {
  const targetCode = "JESUS-SAVES";
  console.log(`Checking if invite code "${targetCode}" exists...`);

  // Check if the code already exists using the direct prisma client
  const existingCode = await prisma.inviteCode.findUnique({
    where: { code: targetCode },
  });

  if (existingCode) {
    console.log(`Invite code "${targetCode}" already exists. Skipping creation.`);
    return;
  }

  // Find the first user to assign the code generation to
  const firstUser = await prisma.user.findFirst();

  if (!firstUser) {
    console.error(
      `Error: No users found in the database. Cannot generate invite code "${targetCode}" without a user to assign it to.`
    );
    // Optionally, throw an error to stop the seeding process
    // throw new Error("Cannot seed invite code: No users found.");
    return; // Or just skip creating the code
  }

  console.log(`Found user ${firstUser.id}. Creating invite code "${targetCode}"...`);

  // Create the invite code using the direct prisma client
  await prisma.inviteCode.create({
    data: {
      code: targetCode,
      generatedByUserId: firstUser.id, // Assign to the first user found
      isClaimed: false,
    },
  });

  console.log(`Successfully created invite code "${targetCode}".`);
}; 
