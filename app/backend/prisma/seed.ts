import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', permissions: { users: ['create', 'read'], campaigns: ['create', 'read'] } }
  });
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!';
  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: { email: 'admin@local.test', password: hashed, firstName: 'Admin', roleId: adminRole.id }
  });
  console.log('✅ Admin: admin@local.test');
  console.log(`   Admin password: ${password}`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
