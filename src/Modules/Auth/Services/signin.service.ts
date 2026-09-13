import { Injectable, Inject, UnauthorizedException, InternalServerErrorException} from "@nestjs/common";
import { AutehticationsDto } from "../authentications.dto";
import * as bcrypt from "bcrypt"
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";
import { JwtOperations } from "src/Common/Utils/AuthenticationsProcols/JwtOperations/operations";
import { PrismaService } from "../../../lib/prisma.service";
import { InitAuthenticationsService } from "./init-authentications.service";
import { RegisterTokensService } from "./register-tokens.service";
import { StartTrialSubscriptionService } from "src/Modules/Subscriptions/Services/start-trial-subscription.service";

@Injectable()
class SignInService
{
        private accessTokenDate: number = 15 * 60 * 1000
        private refreshTokenDate: number = 7*24*60*60*1000
    constructor(
        @Inject(IAuthenticationRepositories)
        private readonly repository: IAuthenticationRepositories,
        private readonly prisma: PrismaService,
        private readonly initAuthenticationsService: InitAuthenticationsService,
        private readonly registerTokensService: RegisterTokensService,
        private readonly startTrialSubscriptionService: StartTrialSubscriptionService

    ){}

    async signin(datas: AutehticationsDto)
    {
        try
        {
            const account = await this.repository.signIn({email: datas.email, password: datas.password})
            if(!account)
            {
                throw new UnauthorizedException("Credencias inválidas")
            }
            const isValidPassword = await bcrypt.compare(datas.password, account.passwordHash)
            if (!isValidPassword)
            {
                throw new UnauthorizedException("Credencias inválidas.")
            }
            if(account.academy && account.academy.status === "PENDING")
            {
                throw new UnauthorizedException("O registro da sua academia ainda não foi aprovada pela central, por favor aguarde.")
            }
            // ✅ Achado desta auditoria: o cron de suspensão por falta de
            // pagamento mudava `academy.status` para SUSPENDED, mas o
            // login nunca verificava esse valor — só bloqueava PENDING.
            // Uma academia suspensa continuava a conseguir criar sessões
            // novas normalmente. Também cobre contas de utilizador
            // (MASTER/INSTRUCTOR/AFFILIATE_ADMIN) ligadas a uma academia
            // suspensa — não só a própria conta-academia.
            if(account.academy && account.academy.status === "SUSPENDED")
            {
                throw new UnauthorizedException("A subscrição da sua academia está suspensa por falta de pagamento. Contacte a Central para regularizar.")
            }
            if(account.academy && account.academy.status === "REJECTED")
            {
                throw new UnauthorizedException("O registro da sua academia não foi aprovado.")
            }
            if(account.user?.academy && account.user.academy.status === "SUSPENDED")
            {
                throw new UnauthorizedException("A subscrição da sua academia está suspensa por falta de pagamento. Contacte a Central para regularizar.")
            }
            // ✅ B-03 FIX: `account.academy.subscription` era acedido antes
            // de confirmar que `account.academy` existe — para qualquer
            // conta ligada a um User (ADMIN_DEV, MASTER, INSTRUCTOR,
            // ATHLETE), isto lançava TypeError e o login terminava em 500.
            // O ramo `else if (account.user)`, mais abaixo, nunca era
            // alcançado.
            let subscription = account.academy?.subscription ?? null
            if(account.academy && !subscription && account.academy.type != "CENTRAL")
            {
                subscription = await this.startTrialSubscriptionService.execute(account.academy.id)
            }

            // ✅ V-05 FIX: `sub` deixou de ser ora um Academy.id ora um
            // User.id (ambíguo, e a origem directa de todas as verificações
            // de posse que comparavam `credentials.sub` com `academyId` e
            // falhavam para contas de utilizador). Agora `sub` é sempre o
            // Account.id, e `academyId` é uma claim própria e explícita —
            // presente sempre que a conta pertence a uma academia ou a um
            // utilizador afecto a uma academia (null para ADMIN_DEV).
            let payload
            if(account.academy)
            {
                payload = {sub: account.id, academyId: account.academy.id, role: account.academy.type, subscriptionStatus: subscription?.status ?? "TRIALING"}
            }
            else if(account.user)
            {
                payload = {sub: account.id, academyId: account.user.academyId ?? null, role: account.user.role}
            }
            else
            {
                throw new UnauthorizedException("Conta sem perfil associado. Contacte o administrador.");
            }
            const accessToken = await JwtOperations.GenerateToken(payload, "access")
            const refreshToken = await JwtOperations.GenerateToken(payload, "refreshToken")

            await this.prisma.$transaction(async(tx)=>{
                const authentication = await this.initAuthenticationsService.initAuthentication({
                    type: "by_token",
                    used:false,
                    expireIn: new Date(Date.now() + this.refreshTokenDate),
                    accountId: account.id
                }, tx)
                await this.registerTokensService.registerTokens({
                    token: refreshToken,
                    token_type: "REFRESH",
                    authenticationId: authentication.id,
                }, tx)
            })
            return {
                success: true,
                statusCode: 200, 
                message:"Login realizado com sucesso",
                datas:{
                accessToken: accessToken,
                refreshToken: refreshToken
                }
            }  
        } catch (error: any)
        {
            if(error instanceof UnauthorizedException)
            {
                throw error
            }
            console.error(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }
}
export{SignInService}