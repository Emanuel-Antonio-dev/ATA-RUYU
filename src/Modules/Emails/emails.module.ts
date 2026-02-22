import { Module } from "@nestjs/common";
import { IEmailProvider } from "./email-provider";
import { SendEmailService } from "./send-email.service";
import { EmailProvider } from "./email-sender";

@Module({
  providers: [
    SendEmailService,
    {
      provide: IEmailProvider,
      useClass: EmailProvider,
    },
  ],
  exports: [SendEmailService, IEmailProvider],
})
export class EmailModule {}
