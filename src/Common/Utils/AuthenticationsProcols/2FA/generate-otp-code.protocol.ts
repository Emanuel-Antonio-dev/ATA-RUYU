import { randomInt } from "crypto"
import bcrypt from 'bcrypt';

class OtpGeneratorService {
  // ✅ V-13 FIX: omissão de 4 para 6 dígitos — 4 dígitos são só 10.000
  // combinações; o limite de 5 tentativas ajuda, mas era contornável
  // pedindo um código novo (sem rate limit nesse pedido antes de V-08).
  // 6 dígitos é o padrão da indústria.
  async generate(digits: number = 6, time: number = 8)
  {
    if(digits < 4 || digits > 8)
    {
      throw new Error("O número de dígitos deve estar entre 4 e 8.")
    }
    const min = Math.pow(10, digits - 1)
    const max = Math.pow(10, digits)

    const otp = randomInt(min, max)
    const expiresAt = new Date(Date.now() + time * 60 * 1000)
    const otpHash = await bcrypt.hash(otp.toString(), 12); // ✅ 5.12 FIX: custo padronizado para 12

    return {
      otpCodeHash: otpHash,
      otpCode: otp.toString(),
      expiresAt,
    }
  }
}
export { OtpGeneratorService }
