import * as jwt from "jsonwebtoken"
import "dotenv/config"

const secret = process.env.JWT_SECRET as string
if(!secret)
{
    throw new Error("JWT_SECRET não definido no arquivo .env");
}

class JwtOperations
{
    static GenerateToken(payload: Record<string, any>, type:"access" | "refreshToken" | "temp")
    {
        if(type === "temp")
        {
            return jwt.sign(payload, secret, {expiresIn:"1h"})
        }
        else if(type === "refreshToken")
        {
            return jwt.sign(payload, secret, {expiresIn:"7d"})
        }
        return jwt.sign(payload, secret, {expiresIn:"24h"})
    }
    static VerifyToken(token: string)
    {
        return jwt.verify(token, secret) as Record<string, any>
    }
}

export{JwtOperations}