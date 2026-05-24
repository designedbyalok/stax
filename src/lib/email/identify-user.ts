import prisma from "@/lib/db";

/**
 * Extract the user's inbound token from the To address.
 * E.g., "+abcdefgh@in.jobstax.com" -> "abcdefgh"
 * E.g., "stax+abcdefgh@in.jobstax.com" -> "abcdefgh"
 */
export function extractTokenFromAddress(toAddress: string): string | null {
  const match = toAddress.match(/\+([a-zA-Z0-9]{8})@/);
  return match ? match[1] : null;
}

/**
 * Look up a user by their inbound email token.
 */
export async function findUserByInboundToken(token: string) {
  return prisma.user.findUnique({
    where: { inboundEmailToken: token },
  });
}
