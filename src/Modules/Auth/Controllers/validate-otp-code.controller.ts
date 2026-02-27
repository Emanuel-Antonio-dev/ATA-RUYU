import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ValidateOtpCodeService } from "../Services/validate-otp-code.service";
import { ValidateOtpDto } from "../authentications.dto";
import { PublicRoute } from "src/Common/Decorators/public.decorator";

@ApiTags("Authentication")
@Controller("auth/otp")
class ValidateOtpController {
  constructor(
    private readonly service: ValidateOtpCodeService
  ) {}

  @ApiOperation({
    summary: "Validação de código OTP",
    description:
      "Valida o código OTP associado a uma autenticação. O código é de uso único e possui tempo de expiração.",
  })
  @ApiResponse({
    status: 200,
    description: "Código OTP validado com sucesso.",
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: "Código válidado com sucesso.",
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Parâmetros obrigatórios não enviados.",
  })
  @ApiUnauthorizedResponse({
    description: "Código inválido, expirado ou já utilizado.",
  })
  @ApiNotFoundResponse({
    description: "Parâmetro de autenticação não encontrado.",
  })
  @PublicRoute()
  @Post("verify")
  async validateOtp(@Body() body: ValidateOtpDto)
  {
    return await this.service.validateOtpCode(body);
  }
}

export { ValidateOtpController };
