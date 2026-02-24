import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { CreateAcademyDto, CreateAcademyRequestDto} from "../Dtos/create-academy.dto";
import sanitize from "sanitize-html"
import { Injectable, Inject, HttpException, InternalServerErrorException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from "src/lib/prisma.service";
import { RegisterAccountService } from "src/Modules/Accounts/Services/register-account.service";
import { generateAffiliateCode } from "src/Common/Utils/generate-codes";

@Injectable()
class RegisterAcademyService
{
    constructor(
        @Inject(IAcademiesRepositories)
        private readonly repositoy: IAcademiesRepositories,
        private readonly accountsService: RegisterAccountService,
        private readonly prisma: PrismaService,
    ){}

    async register(datas: CreateAcademyRequestDto)
    {
        try
        {
            if(!datas.logoUrl)
            {
                throw new BadRequestException("É obrigatório enviar o logo da academia.")
            }
            const existsAcdemy = await this.repositoy.findAcademyById({action:"OnlyBasicsDatas"},undefined, datas.name)
            if(existsAcdemy)
            {
                throw new ConflictException("Este nome já está sendo usado.")
            }
            const datasSanitized = {
                name: sanitize(datas.name,{
                    allowedTags: [],
                    allowedAttributes: {},
                    allowedClasses:{}
                }),
                type: datas.type,
                address: datas.address ? sanitize(datas.address,{
                    allowedTags: [],
                    allowedAttributes: {},
                    allowedClasses:{}
                }) : undefined,
                province: datas.province ? sanitize(datas.province,{
                    allowedTags: [],
                    allowedAttributes: {},
                    allowedClasses:{}
                }) : undefined,
                city: datas.city ? sanitize(datas.city,{
                    allowedTags: [],
                    allowedAttributes: {},
                    allowedClasses:{}
                }) : undefined,
            }

            const transaction = await this.prisma.$transaction((async(tx)=>{
                const account = await this.accountsService.registerAccount({email: datas.email, phone_number: datas.phone_number!, password: datas.password}, tx)
                if(!account||!account.datas)
                {
                    throw new InternalServerErrorException(account.message || "Erro ao criar conta da academia.")
                }
                let affiliateCode: string | undefined = undefined;
                if (datas.type === "AFFILIATE") {
                    while (true)
                    {
                        affiliateCode = generateAffiliateCode();
                        const conflict = await tx.academy.findUnique({
                            where: { affiliateNumber: affiliateCode },
                        });
                        if (!conflict) break;
                    }
                }
                const academy = await this.repositoy.createAcademy(
                    {
                        accountId: account.datas.id,
                        name: datasSanitized.name,
                        type: "AFFILIATE",
                        address: datasSanitized.address,
                        province: datasSanitized.province,
                        city: datasSanitized.city,
                        logoUrl: datas.logoUrl,
                        affiliateCode: affiliateCode,
                    }, tx)
                    console.log(academy)
                if(!academy)
                {
                    throw new HttpException("Ocorreu um erro ao criar esta academia.", 500)
                }
                return {
                    id: academy.id,
                    name: academy.name,
                    type: academy.type,
                    email: account.datas.email,
                    phone: account.datas.phone,
                    address: academy.address,
                    province: academy.province,
                    city: academy.city,
                    status: academy.status,
                    affiliateCode: academy.affiliateNumber ?? null,
                    logoUrl: academy.logoUrl,
                    createdAt: academy.createdAt,
                }

            }))
            const message = transaction.type === 'CENTRAL'
            ? 'Academia central criada com sucesso. Acesso liberado.'
            : 'Academia afiliada criada com sucesso. Aguarde a aprovação da Central.';
        return {success: true, statusCode: 201, message, datas: transaction}
        }
        catch(error: any)
        {
            if(error instanceof HttpException)
            {
                throw error
            }
            console.log(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }
}
export {RegisterAcademyService}