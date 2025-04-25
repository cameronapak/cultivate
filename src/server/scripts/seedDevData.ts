import type { PrismaClient, User } from '@prisma/client'
import type { DbSeedFn } from 'wasp/server' // Import Wasp's seed function type
import { sanitizeAndSerializeProviderData } from 'wasp/server/auth' // Import helper for password hashing

/**
 * Seeds a specific invite code if it doesn't exist.
 * Creates a default user ('dev_user') if no users exist.
 */
export const seedDevInviteCode: DbSeedFn = async (prisma: PrismaClient): Promise<void> => {
  const targetCode = "JESUS-SAVES";
  console.log(`Checking if invite code "${targetCode}" exists...`);

  // Check if the code already exists
  const existingCode = await prisma.inviteCode.findUnique({
    where: { code: targetCode },
  });

  if (existingCode) {
    console.log(`Invite code "${targetCode}" already exists. Skipping creation.`);
    return;
  }

  // Check for existing user or create one
  let userToAssign: User | null = await prisma.user.findFirst();
  let userIdToAssign: number;

  if (!userToAssign) {
    console.log("No users found. Creating default user 'dev_user'...");
    const defaultUsername = 'dev_user';
    const defaultPassword = 'password'; // Use a simple password for dev seeding

    try {
      userToAssign = await prisma.user.create({
        data: {
          // Assuming your User model doesn't need other required fields besides ID
          // If it does, add them here.
          auth: {
            create: {
              identities: {
                create: {
                  providerName: 'username', // Matches the auth method
                  providerUserId: defaultUsername,
                  // Use Wasp helper to hash password correctly
                  providerData: await sanitizeAndSerializeProviderData<'username'>({ 
                    hashedPassword: defaultPassword, 
                  }),
                },
              },
            },
          },
        },
      });
      userIdToAssign = userToAssign.id;
      console.log(`Default user '${defaultUsername}' created with ID: ${userIdToAssign}`);
    } catch (error) {
      console.error("Failed to create default user:", error);
      // Decide how to handle: stop seeding or try to continue without the code?
      // For now, we'll stop.
      throw new Error("Failed to create default user, cannot seed invite code."); 
    }
  } else {
    userIdToAssign = userToAssign.id;
    console.log(`Using existing user with ID: ${userIdToAssign} to generate invite code.`);
  }

  // Proceed to create the invite code
  console.log(`Creating invite code "${targetCode}" for user ID ${userIdToAssign}...`);

  await prisma.inviteCode.create({
    data: {
      code: targetCode,
      generatedByUserId: userIdToAssign, // Assign to the found or created user
      isClaimed: false,
    },
  });

  console.log(`Successfully created invite code "${targetCode}".`);
}; 
