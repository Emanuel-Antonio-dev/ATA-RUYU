import { Inject, Injectable } from "@nestjs/common";
import { IEmailProvider } from "./email-provider";

@Injectable()
class SendEmailService {
  constructor(@Inject(IEmailProvider) private readonly emailProvider: IEmailProvider) {}

  async sendEmail(email: string, subject: string, templateForBody: string) {
    await this.emailProvider.sendEmail({
      from: { email: "ataruyu@suporte.gmail.com", name: "Equipe ATA-RUYU" },
      to: { name: `ATAT-RUYUS ${email}`, email: email },
      subject: subject,
      body: templateForBody,
    });
  }
}

export { SendEmailService };
