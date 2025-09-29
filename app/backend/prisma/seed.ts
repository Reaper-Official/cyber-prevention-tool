const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Créer le rôle Admin
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { 
      name: 'Admin', 
      permissions: { 
        users: ['create', 'read', 'update', 'delete'], 
        campaigns: ['create', 'read', 'update', 'delete'] 
      } 
    }
  });

  console.log('✅ Role created:', adminRole);

  // Créer l'utilisateur admin
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!';
  const hashed = await bcrypt.hash(password, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: { 
      email: 'admin@local.test', 
      password: hashed, 
      firstName: 'Admin',
      roleId: adminRole.id 
    }
  });

  console.log('✅ Admin user created:', adminUser.email);
  console.log('📧 Email: admin@local.test');
  console.log('🔑 Password:', password);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });