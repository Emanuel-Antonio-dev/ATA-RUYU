import { randomInt } from "crypto"
import bcrypt from 'bcrypt';

class OtpGeneratorService {
  async generate(digits: number = 4, time: number = 8)
  {
    if(digits < 4 || digits > 8)
    {
      throw new Error("O número de dígitos deve estar entre 4 e 8.")
    }
    const min = Math.pow(10, digits - 1)
    const max = Math.pow(10, digits)

    const otp = randomInt(min, max)
    const expiresAt = new Date(Date.now() + time * 60 * 1000)
    const otpHash = await bcrypt.hash(otp.toString(), 10);

    return {
      otpCodeHash: otpHash,
      otpCode: otp.toString(),
      expiresAt,
    }
  }
}
export { OtpGeneratorService }
