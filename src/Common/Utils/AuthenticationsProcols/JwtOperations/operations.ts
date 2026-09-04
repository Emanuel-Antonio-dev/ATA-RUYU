import * as jwt from "jsonwebtoken"
import "dotenv/config"

const secret = process.env.JWT_SECRET as string
if(!secret)
{
    throw new Error("JWT_SECRET não definido no arquivo .env");
}

// ✅ V-04 FIX: os três tipos de token eram assinados com o mesmo segredo e
// o mesmo payload, distinguindo-se só pela expiração — um refresh token
// (7 dias) ou temp token (1h) enviado como Authorization: Bearer era aceite
// pelo guard como token de acesso válido, anulando o desenho de tokens
// curtos. Agora cada token carrega a claim `typ`, e o guard exige o valor
// esperado antes de aceitar o token.
type TokenKind = "access" | "refreshToken" | "temp";

const TYP_BY_KIND: Record<TokenKind, "access" | "refresh" | "temp"> = {
    access: "access",
    refreshToken: "refresh",
    temp: "temp",
};

class JwtOperations
{
    static GenerateToken(payload: Record<string, any>, type: TokenKind)
    {
        const signedPayload = { ...payload, typ: TYP_BY_KIND[type] };
        if(type === "temp")
        {
            return jwt.sign(signedPayload, secret, {expiresIn:"1h"})
        }
        else if(type === "refreshToken")
        {
            return jwt.sign(signedPayload, secret, {expiresIn:"7d"})
        }
        return jwt.sign(signedPayload, secret, {expiresIn:"15min"})
    }
    static VerifyToken(token: string, expectedTyp?: "access" | "refresh" | "temp")
    {
        const decoded = jwt.verify(token, secret) as Record<string, any>
        if (expectedTyp && decoded.typ !== expectedTyp)
        {
            throw new jwt.JsonWebTokenError("Tipo de token inválido para esta operação.")
        }
        return decoded
    }
}

export{JwtOperations}