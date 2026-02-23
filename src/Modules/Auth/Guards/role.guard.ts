import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "src/Common/Decorators/roles.decorator";

@Injectable()
class RolesGuard implements CanActivate
{
    constructor(private reflactor: Reflector){}

    async canActivate(context: ExecutionContext): Promise<boolean>
    {
        const requiredRoles = this.reflactor.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        if(!requiredRoles)
        {
            return true
        }
        const request = context.switchToHttp().getRequest()
        const credentials = request.credentials 
        if(!credentials || !requiredRoles.includes(credentials.role))
        {
            throw new ForbiddenException("Você não tem autorização para acessar este recurso.")
        }
        return true
    }
}
export{RolesGuard}