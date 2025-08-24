import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  
  // Crear usuario admin
  await prisma.user.upsert({
    where: { email: 'admin@joyeria.com' },
    update: {},
    create: {
      email: 'admin@joyeria.com',
      password,
      role: 'admin'
    }
  });

  console.log('✅ Datos de prueba creados exitosamente');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });