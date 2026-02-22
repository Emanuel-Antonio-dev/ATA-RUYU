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
            tls: {
                rejectUnauthorized: false,
            }
        })
    }
    async sendEmail(message: IMessage): Promise<void> {
        await this.transporter.sendMail({
            to: {
                name: message.to.name,
                address: message.to.email
            },
            from:{
                name: message.to.name,
                address: message.to.email
            },
            subject: message.subject,
            html: message.body
        })
    }
}

export{EmailProvider}