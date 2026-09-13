// src/Modules/Emails/Templates/base-layout.ts

// ✅ Paleta extraída da landing page (localhost:8080): fundo creme, texto
// preto/quase-preto, destaque dourado/âmbar (a palavra "RYU" e "unifica"),
// botão pill preto, selo de confiança em verde-esmeralda.
const COLORS = {
  background: "#FBF3E7",
  cardBackground: "#FFFFFF",
  textDark: "#1C1917",
  textMuted: "#6B7280",
  accentGold: "#C8853A",
  buttonBackground: "#1C1917",
  buttonText: "#FBF3E7",
  border: "#EDE3D3",
  trustGreen: "#059669",
};

interface EmailLayoutParams {
  /** Texto que aparece na pré-visualização da caixa de entrada (invisível no corpo) */
  previewText: string;
  /** Título grande dentro do cartão (ex: "Verifique o seu email") */
  heading: string;
  /** Corpo do email — HTML já pronto (parágrafos, botão, etc.) */
  bodyHtml: string;
}

/**
 * Botão pill preto, igual ao "Solicitar demonstração" da landing page.
 * Usar dentro de `bodyHtml` quando o email precisar de uma call-to-action.
 */
export function renderButton(label: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px auto;">
      <tr>
        <td style="border-radius: 999px; background-color: ${COLORS.buttonBackground};">
          <a href="${url}" target="_blank"
             style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 600;
                    color: ${COLORS.buttonText}; text-decoration: none; border-radius: 999px; font-family: Arial, Helvetica, sans-serif;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

/** Bloco de código destacado (usado no email de OTP). */
export function renderCodeBlock(code: string): string {
  return `
    <div style="margin: 28px auto; text-align: center;">
      <span style="display: inline-block; padding: 16px 28px; font-size: 32px; font-weight: 700;
                   letter-spacing: 8px; color: ${COLORS.textDark}; background-color: ${COLORS.background};
                   border: 1px solid ${COLORS.border}; border-radius: 12px; font-family: 'Courier New', monospace;">
        ${code}
      </span>
    </div>`;
}

export function renderEmailLayout({ previewText, heading, bodyHtml }: EmailLayoutParams): string {
  return `
<!DOCTYPE html>
<html lang="pt-AO">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: Arial, Helvetica, sans-serif;">
  <!-- pré-visualização invisível na caixa de entrada -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${previewText}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.background}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">

          <!-- Logótipo -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <span style="font-size: 22px; font-weight: 700; color: ${COLORS.textDark}; font-family: Arial, Helvetica, sans-serif;">
                ATA-<span style="color: ${COLORS.accentGold};">RYU</span>
              </span>
            </td>
          </tr>

          <!-- Cartão de conteúdo -->
          <tr>
            <td style="background-color: ${COLORS.cardBackground}; border: 1px solid ${COLORS.border}; border-radius: 16px; padding: 40px 36px;">
              <h1 style="margin: 0 0 20px 0; font-size: 24px; line-height: 1.3; font-weight: 700; color: ${COLORS.textDark}; text-align: center;">
                ${heading}
              </h1>
              <div style="font-size: 15px; line-height: 1.7; color: ${COLORS.textMuted}; text-align: center;">
                ${bodyHtml}
              </div>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td align="center" style="padding-top: 28px;">
              <p style="margin: 0; font-size: 12px; color: ${COLORS.textMuted};">
                A plataforma que unifica a sua rede de Jiu-Jitsu.
              </p>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: ${COLORS.textMuted};">
                © ${new Date().getFullYear()} ATA-RYU. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export { COLORS };
