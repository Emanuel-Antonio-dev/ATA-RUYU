// src/Modules/Emails/Templates/otp-code.template.ts

import { renderEmailLayout, renderCodeBlock } from "./base-layout";

export function renderOtpCodeEmail(code: string): string {
  return renderEmailLayout({
    previewText: `O seu código de verificação é ${code}`,
    heading: "O seu código de verificação",
    bodyHtml: `
      <p style="margin: 0 0 8px 0;">Use o código abaixo para concluir a sua verificação em duas etapas:</p>
      ${renderCodeBlock(code)}
      <p style="margin: 0;">Este código é válido por <strong>15 minutos</strong>.</p>
      <p style="margin: 16px 0 0 0;">Se não foi você que pediu este código, ignore este email — a sua conta continua segura.</p>
    `,
  });
}
