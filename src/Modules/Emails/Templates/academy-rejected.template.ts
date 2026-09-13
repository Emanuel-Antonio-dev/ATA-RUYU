// src/Modules/Emails/Templates/academy-rejected.template.ts

import { renderEmailLayout } from "./base-layout";

export function renderAcademyRejectedEmail(academyName: string): string {
  return renderEmailLayout({
    previewText: `Actualização sobre o registo da academia ${academyName}`,
    heading: "Actualização do seu registo",
    bodyHtml: `
      <p style="margin: 0 0 8px 0;">O registo da academia <strong>${academyName}</strong> não foi aprovado pela Central neste momento.</p>
      <p style="margin: 0;">Se acredita que isto é um engano, ou se quiser mais informações sobre os critérios de aprovação, contacte a Central para esclarecer a situação.</p>
    `,
  });
}
