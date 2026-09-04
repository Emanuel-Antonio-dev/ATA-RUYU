import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { CreateAcademyDto, CreateAcademyRequestDto} from "../Dtos/create-academy.dto";
import sanitize from "sanitize-html"
import { Injectable, Inject, HttpException, InternalServerErrorException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from "src/lib/prisma.service";
import { RegisterAccountService } from "src/Modules/Accounts/Services/register-account.service";
import { generateAffiliateNumber } from "src/Common/Utils/generate-codes";
import {CacheService} from "../../Cache/cache.service";

@Injectable()
class RegisterAcademyService
{
    constructor(
        @Inject(IAcademiesRepositories)
        private readonly repositoy: IAcademiesRepositories,
        private readonly accountsService: RegisterAccountService,
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
    ){}

    async register(datas: CreateAcademyRequestDto)
    {
        try
        {
            if(!datas.logoUrl)
            {
                throw new BadRequestException("É obrigatório enviar o logo da academia.")
            }
            // ✅ B-09 FIX: `type` era sempre gravado como "AFFILIATE",
            // ignorando `datas.type` em silêncio (decisão de segurança
            // correcta — impede auto-registo como CENTRAL — mas registar
            // com `type: CENTRAL` produzia uma academia AFFILIATE sem
            // affiliateNumber, um estado inconsistente). Agora rejeita
            // explicitamente em vez de ignorar.
            if(datas.type === "CENTRAL")
            {
                throw new BadRequestException("Não é possível auto-registar uma academia do tipo Central.")
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
                // ✅ B-07 FIX: substituído o "gera → verifica → repete" (uma
                // corrida clássica: duas academias podiam gerar o mesmo
                // número entre a verificação e a escrita, e o ciclo
                // aproximava-se de infinito à medida que o espaço de 9.000
                // valores enchia) por "tenta criar → se colidir (P2002),
                // gera outro e tenta de novo", num número limitado de
                // tentativas. Com o novo espaço de ~1,7×10¹² valores, uma
                // colisão é praticamente impossível de qualquer forma.
                const MAX_ATTEMPTS = 5;
                let academy: any = null;
                let lastError: any = null;
                for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
                    const affiliateNumber = datas.type === "AFFILIATE" ? generateAffiliateNumber() : undefined;
                    try {
                        academy = await this.repositoy.createAcademy(
                            {
                                accountId: account.datas.id,
                                name: datasSanitized.name,
                                // ✅ B-09 FIX: o tipo continua sempre fixo em
                                // "AFFILIATE" aqui — é a decisão de segurança
                                // certa (ninguém se auto-regista como
                                // CENTRAL) — mas agora o pedido é
                                // explicitamente rejeitado mais acima se
                                // `datas.type === "CENTRAL"`, em vez de ser
                                // ignorado em silêncio.
                                type: "AFFILIATE",
                                address: datasSanitized.address,
                                province: datasSanitized.province,
                                city: datasSanitized.city,
                                logoUrl: datas.logoUrl,
                                affiliateNumber: affiliateNumber,
                            }, tx)
                        break;
                    } catch (err: any) {
                        lastError = err;
                        if (err?.code === "P2002") {
                            continue; // colisão no affiliateNumber — tenta outro
                        }
                        throw err;
                    }
                }
                if(!academy)
                {
                    console.error("Falha ao gerar affiliateNumber único após várias tentativas:", lastError);
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
                    affiliateNumber: academy.affiliateNumber ?? null,
                    logoUrl: academy.logoUrl,
                    createdAt: academy.createdAt,
                }

            }))
            
            this.cacheService.invalidatePattern("academies:list:");
            this.cacheService.invalidatePattern("academy:");
            this.cacheService.invalidatePattern("dashboard:academy:");            
            
            const message = 'Academia afiliada criada com sucesso. Aguarde a aprovação da Central.';
        return {success: true, statusCode: 201, message, datas: transaction}
        }
        catch(error: any)
        {
            if(error instanceof HttpException)
            {
                throw error
            }
            console.error(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }
}
export {RegisterAcademyService}