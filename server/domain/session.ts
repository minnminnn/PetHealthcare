import type { Role } from "@prisma/client";
import type { JWT } from "next-auth/jwt";

// Both credentials and OAuth sessions must consult the current account state.
export function refreshAccountToken(
  token: JWT,
  account: { role: Role; isActive: boolean } | null,
): JWT | null {
  if (!account?.isActive) return null;
  return { ...token, role: account.role };
}
