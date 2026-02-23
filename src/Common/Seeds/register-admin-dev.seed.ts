import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/lib/prisma.service';
import "dotenv/config"

const prisma = new PrismaService();

async function seedAdmin()
{
    console.log('🌱 A iniciar seed...');
    const existsAccount = await prisma.account.findUnique({where: {email: process.env.SYSTEM_ADMIN_EMAIL}});
    const existsPhoneNumber = await prisma.account.findUnique({where: {phone: process.env.SYSTEM_ADMIN_PHONE_NUMBER}});
    if(existsAccount)
    {
        console.log('⚠️  Email associado à conta admin já existe — seed ignorado.');
        return;
    }
    if(existsPhoneNumber)
    {
        console.log('⚠️  Número de telefone associado à conta admin já existe — seed ignorado.');
        return;
    }
    const passwordHash = await bcrypt.hash(process.env.SYSTEM_ADMIN_PASSWORD!, 10);

    await prisma.$transaction(async (tx) => {
        const account = await tx.account.create({
            data: {
                email: process.env.SYSTEM_ADMIN_EMAIL!,
                phone: process.env.SYSTEM_ADMIN_PHONE_NUMBER,
                passwordHash,
                isActive: true,
                isVerified: true,
            },
        });
        
        await tx.user.create({
            data: {
                accountId: account.id,
                role: "ADMIN_DEV",
                fullName: process.env.SYSTEM_ADMIN_FIRST_NAME + " " + process.env.SYSTEM_ADMIN_LAST_NAME,
                isActive: true,
            },
    })
}).then(()=>{
    console.log('✅ Conta admin criada com sucesso.');
}).catch((error)=>{
    console.log('❌ Erro ao criar conta admin:', error);
})
}

seedAdmin()