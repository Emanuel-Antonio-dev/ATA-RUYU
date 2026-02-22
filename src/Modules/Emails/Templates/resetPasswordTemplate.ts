import dotenv from "dotenv"
dotenv.config()

function HtmlTemplateResetPassword(token: string): string
{ 
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de Senha</title>
    <style>
        /* Estilos globais */
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            background-color: #4CAF50;
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }

        .email-header h1 {
            margin: 0;
            font-size: 24px;
        }

        .email-body {
            padding: 20px;
            line-height: 1.6;
        }

        .email-body p {
            margin: 0 0 15px 0;
        }

        .email-body a {
            color: #4CAF50;
            text-decoration: none;
            font-weight: bold;
        }

        .email-body a:hover {
            text-decoration: underline;
        }

        .email-footer {
            text-align: center;
            padding: 15px;
            background-color: #f4f4f4;
            color: #777;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Cabeçalho -->
        <div class="email-header">
            <h1>Redefinição de Senha</h1>
        </div>

        <!-- Corpo do e-mail -->
        <div class="email-body">
            <p>Olá,</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta. Caso tenha sido você, use o link abaixo para criar uma nova senha:</p>
            <p>
                <a href="${process.env.RESET_PASSWORD_URI}?authorization=${token}" target="_blank" style="color: #4CAF50; text-decoration: none; font-weight: bold;">
                    Redefinir Senha
                </a>
            </p>
            <p>Este link é válido por <strong>1 hora</strong>.</p>
            <p>Se você não solicitou a alteração de senha, ignore este e-mail. Sua conta permanecerá segura.</p>
            <p>Atenciosamente,</p>
            <p><strong>Equipe de Suporte</strong></p>
        </div>

        <!-- Rodapé -->
        <div class="email-footer">
            <p>© 2025 Mulembe. Todos os direitos reservados.</p>
            <p>Você está recebendo este e-mail porque se cadastrou na Academia Egaf. Se não foi você, por favor, ignore este e-mail.</p>
        </div>
    </div>
</body>
</html>`

}
export {HtmlTemplateResetPassword}