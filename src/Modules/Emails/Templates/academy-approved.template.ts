// src/Modules/Emails/Templates/academy-approved.template.ts

import { renderEmailLayout, renderButton } from "./base-layout";

export function renderAcademyApprovedEmail(academyName: string, loginUrl: string): string {
  return renderEmailLayout({
    previewText: `A academia ${academyName} foi aprovada — bem-vindo ao ATA-RYU`,
    heading: "A sua academia foi aprovada! 🥋",
    bodyHtml: `
      <p style="margin: 0 0 8px 0;">Parabéns! O registo da academia <strong>${academyName}</strong> foi aprovado pela Central.</p>
      <p style="margin: 0;">Já pode aceder à plataforma que unifica a sua rede de Jiu-Jitsu — registe atletas, marque presenças, acompanhe graduações e muito mais, tudo num único sistema.</p>
      ${renderButton("Aceder à plataforma", loginUrl)}
      <p style="margin: 16px 0 0 0;">Bem-vindo(a) à família ATA-RYU!</p>
    `,
  });
}
