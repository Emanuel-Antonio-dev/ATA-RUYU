import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiPropertyOptional
} from "@nestjs/swagger";
import { PublicRoute } from "src/Common/Decorators/public.decorator";
import { SendOtpCodeService } from "../Services/send-otp.service";
import { SendOtpDto } from "../authentications.dto";

@ApiTags("Autenticação")
@Controller("auth/otp")
class SendOtpController {
  constructor(
    private readonly service: SendOtpCodeService
  ) {}

  @ApiOperation({
    summary: "Envio de código OTP",
    description:
      "Envia o código OTP. O código é de uso único e possui tempo de expiração.",
  })
  @ApiBody({ type:  SendOtpDto})
  @ApiResponse({
    status: 200,
    description: "Pedido de redefinição enviado com sucesso.",
  })

  @ApiResponse({
    status: 200,
    description: "Código OTP enviado com sucesso.",
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: "Código enviado com sucesso.",
      },
    },
  })
  @PublicRoute()
  @Post("send")
  async sendOtpCode(@Body() body: SendOtpDto)
  {
    return await this.service.sendOtpCode(body.email, body.phone_number);
  }
}

export { SendOtpController };
