// prisma/seed.ts

import { PrismaClient, AcademyStatus, AcademyType, UserRole } from 'generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/lib/prisma.service';
import "dotenv/config"

const prisma = new PrismaService();

async function seedCentralAccount() {
  console.log('🌱 A iniciar seed...');

  // Evita duplicar se já existir
  const exists = await prisma.account.findUnique({
    where: { email: process.env.CENTRAL_ADMIN_EMAIL, phone: process.env.CENTRAL_ADMIN_PHONE_NUMBER },
  });

  if (exists) {
    console.log('⚠️  Conta central já existe — seed ignorado.');
    return;
  }

  const passwordHash = await bcrypt.hash(process.env.CENTRAL_ADMIN_PASSWORD!, 10);

  await prisma.$transaction(async (tx) => {
    // 1. Cria a conta
    const account = await tx.account.create({
      data: {
        email:        process.env.CENTRAL_ADMIN_EMAIL!,
        phone:        process.env.CENTRAL_ADMIN_PHONE_NUMBER,
        passwordHash,
        isActive:     true,
        isVerified:   true,
      },
    });

    // 2. Cria a academia central
    await tx.academy.create({
      data: {
        name:       'Aliança do Tatame — Central',
        type:       AcademyType.CENTRAL,
        status:     AcademyStatus.ACTIVE,
        address: "Rua da Missão, nº 45",
        province:   'Luanda',
        city:       'Luanda',
        approvedAt: new Date(),
        accountId:  account.id,
      },
    });

    // 3. Cria o utilizador com role CENTRAL
    // await tx.user.create({
    //   data: {
    //     accountId:  account.id,
    //     academyId:  academy.id,
    //     role:       UserRole.CENTRAL,
    //     fullName:   `${process.env.CENTRAL_ADMIN_FIRST_NAME} ${process.env.CENTRAL_ADMIN_LAST_NAME}`,
    //     isActive:   true,
    //   },
    // });

    console.log('✅ Conta central criada:');
  });
}

seedCentralAccount()
  .catch((error) => {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });