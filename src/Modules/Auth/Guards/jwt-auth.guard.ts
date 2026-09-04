import { Injectable, CanActivate, ExecutionContext, UnauthorizedException , InternalServerErrorException} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "src/Common/Decorators/public.decorator";
import { JwtOperations } from "src/Common/Utils/AuthenticationsProcols/JwtOperations/operations";

@Injectable()
class JwtAuthGuard implements CanActivate
{
    constructor(private reflactor: Reflector){}

    private extractTokenFromHeader(request: Request): string | undefined
    {
        const [type, token] = request.headers.authorization?.split(' ') ?? []
        return type == "Bearer" ? token: undefined
    }
    async canActivate(context: ExecutionContext): Promise<boolean> 
    {
        const isPublic = this.reflactor.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        if(isPublic)
        {
            return true
        }
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers["authorization"]
        if(!authHeader)
        {
            throw new UnauthorizedException("Recurso de verificação não encontrado.")
        }
        const token = this.extractTokenFromHeader(request)
        if(!token)
        {
            throw new UnauthorizedException("Recurso de verificação inválido.")
        }
        try
        {
            // ✅ V-04 FIX: exige explicitamente um token do tipo "access" —
            // um refresh token (7 dias de validade) ou temp token deixam de
            // ser aceites como credencial de acesso normal.
            const payload = JwtOperations.VerifyToken(token, "access")
            request.credentials = payload
            return true
        } catch (error: any)
        {
            console.error("Erro ao verificar o token:", error);
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException("Sessão expirou, por favor faça login novamente.");
            }
            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException("Por favor, faça login novamente.");
            }
            if (error instanceof UnauthorizedException)
            {
                throw new UnauthorizedException("Você não tem permissão para acessar este recurso!")
            }
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }
}
export{JwtAuthGuard}