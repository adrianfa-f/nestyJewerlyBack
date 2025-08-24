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

  // Crear algunos productos de muestra
  await prisma.product.createMany({
    data: [
      {
        name: 'Anillo de Diamantes',
        description: 'Anillo de oro blanco con diamantes',
        price: 899.99,
        sku: 'ANI-DIAM-001',
        stock: 10,
        category: 'Anillos',
        images: ['https://via.placeholder.com/300?text=Anillo+Diamantes']
      },
      {
        name: 'Collar de Perlas',
        description: 'Collar de perlas naturales con cierre de oro',
        price: 650.50,
        sku: 'COL-PERL-002',
        stock: 5,
        category: 'Collares',
        images: ['https://via.placeholder.com/300?text=Collar+Perlas']
      },
      {
        name: 'Reloj de Lujo',
        description: 'Reloj automático con correa de cuero genuino',
        price: 1200.00,
        sku: 'REL-LUJO-003',
        stock: 8,
        category: 'Relojes',
        images: ['https://via.placeholder.com/300?text=Reloj+Lujo']
      }
    ],
    skipDuplicates: true
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