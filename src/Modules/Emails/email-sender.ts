import * as nodemailer from "nodemailer"
import { IEmailProvider, IMessage } from "./email-provider";
import "dotenv/config"
import Mail from "nodemailer/lib/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
class EmailProvider implements IEmailProvider
{
    private transporter: Mail
    constructor()
    {
        this.transporter = nodemailer.createTransport({
            host: String(process.env.SMTP_HOST),
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: String(process.env.SMTP_USER),
                pass: String(process.env.SMTP_PASSWORD)
            },
            // ✅ V-07 FIX: `rejectUnauthorized: false` aceitava qualquer
            // certificado TLS, incluindo auto-assinado — um atacante em
            // posição de rede conseguia interceptar a ligação SMTP e ler
            // os emails de recuperação de senha (token em claro), o que
            // transforma um MITM passivo em tomada de conta completa. Se
            // um servidor interno precisar de um certificado próprio, o CA
            // deve ser fornecido via `tls.ca`, nunca desligando a
            // verificação.
        })
    }
    async sendEmail(message: IMessage): Promise<void> {
        await this.transporter.sendMail({
            to: {
                name: message.to.name,
                address: message.to.email
            },
            // ✅ FIX: usava `message.to` também como remetente — todo email
            // enviado pelo sistema aparecia como enviado pelo próprio
            // destinatário, para si mesmo. `IMessage.from` já existe na
            // interface mas nunca era usado.
            from:{
                name: message.from?.name ?? String(process.env.SMTP_FROM_NAME ?? "Aliança do Tatame"),
                address: message.from?.email ?? String(process.env.SMTP_USER)
            },
            subject: message.subject,
            html: message.body
        })
    }
}

export{EmailProvider}