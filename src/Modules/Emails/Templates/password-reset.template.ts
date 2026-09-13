// src/Modules/Emails/Templates/password-reset.template.ts

import { renderEmailLayout, renderButton } from "./base-layout";

export function renderPasswordResetEmail(resetUrl: string): string {
  return renderEmailLayout({
    previewText: "Pedido de recuperação de senha",
    heading: "Recuperar a sua senha",
    bodyHtml: `
      <p style="margin: 0 0 8px 0;">Recebemos um pedido para repor a senha da sua conta ATA-RYU.</p>
      <p style="margin: 0;">Clique no botão abaixo para criar uma nova senha:</p>
      ${renderButton("Redefinir senha", resetUrl)}
      <p style="margin: 0;">Este link é válido por <strong>1 hora</strong>.</p>
      <p style="margin: 16px 0 0 0;">Se não foi você que pediu isto, ignore este email — a sua senha actual continua válida e nada foi alterado.</p>
    `,
  });
}
