// /lib/requireAdmin.ts

import { prisma } from './prisma';
import { getUserIdFromRequest } from './authUser';

export async function requireAdmin() {
  const userId = await getUserIdFromRequest();
  if (!userId) throw new Error('401');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (!user.isAdmin && !user.isSuperAdmin)) throw new Error('403');
  return user;
}
