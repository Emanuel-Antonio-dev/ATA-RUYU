function Welcome(email: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matrícula Confirmada - Academia EGAF</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
            --primary: #2563eb;
            --primary-light: #dbeafe;
            --text: #1f2937;
            --text-light: #6b7280;
            --white: #ffffff;
            --gray-light: #f9fafb;
            --success: #10b981;
            --warning: #f59e0b;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--gray-light);
            margin: 0;
            padding: 0;
            color: var(--text);
            line-height: 1.5;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .card {
            background: var(--white);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
        }
        
        .header {
            background: var(--primary);
            color: var(--white);
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            margin: 16px 0 8px;
            font-size: 24px;
            font-weight: 700;
        }
        
        .content {
            padding: 32px;
        }
        
        .icon {
            display: inline-flex;
            width: 64px;
            height: 64px;
            background-color: var(--primary-light);
            border-radius: 50%;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
        }
        
        .icon svg {
            width: 32px;
            height: 32px;
            color: var(--primary);
        }
        
        .message {
            text-align: center;
            margin-bottom: 24px;
            font-size: 16px;
        }
        
        .email-box {
            background-color: var(--primary-light);
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            text-align: center;
            border-left: 4px solid var(--primary);
        }
        
        .email {
            font-weight: 600;
            color: var(--primary);
            word-break: break-all;
        }
        
        .btn {
            display: inline-block;
            background-color: var(--primary);
            color: var(--white);
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            margin: 16px 0;
            transition: background-color 0.2s;
        }
        
        .btn:hover {
            background-color: #1d4ed8;
        }
        
        .steps {
            margin: 32px 0;
        }
        
        .steps h3 {
            color: var(--primary);
            font-size: 18px;
            margin-bottom: 16px;
        }
        
        .steps ul {
            padding-left: 24px;
        }
        
        .steps li {
            margin-bottom: 8px;
        }
        
        .note {
            background-color: #fffbeb;
            border-left: 4px solid var(--warning);
            padding: 16px;
            margin: 24px 0;
            border-radius: 8px;
            font-size: 15px;
        }
        
        .footer {
            margin-top: 32px;
            color: var(--text-light);
            font-size: 14px;
            text-align: center;
        }
        
        .footer a {
            color: var(--primary);
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Matrícula Confirmada!</h1>
                <p>Sua jornada na Academia EGAF começa agora</p>
            </div>
            
            <div class="content">
                <div class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                
                <p class="message">Olá futuro aluno! Sua matrícula foi confirmada com sucesso.</p>

                <div class="email-box">
                    <p>Seu acesso à plataforma está liberado para:</p>
                    <div class="email">${email}</div>
                    <p>Clique abaixo para acessar sua área exclusiva:</p>
                </div>
                
                <div style="text-align: center;">
                    <a href="#" class="btn">ACESSAR ÁREA DO ALUNO</a>
                </div>
                
                <div class="note">
                    <strong>Importante:</strong> Você está pronto para começar sua jornada de aprendizado!
                </div>
                
                <div class="steps">
                    <h3>Prepare-se para o sucesso</h3>
                    <ul>
                        <li>Acesse nossa plataforma para acompanhar seu progresso</li>
                        <li>Use roupas confortáveis e tênis apropriados</li>
                        <li>Mantenha-se hidratado durante as aulas</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p>Precisa de ajuda? Entre em contato:</p>
                    <p>
                        <a href="mailto:contato@egafacademia.com">contato@egafacademia.com</a> | 
                        <a href="tel:+5511999999999">(11) 99999-9999</a>
                    </p>
                    <p style="margin-top: 16px;">© ${new Date().getFullYear()} Academia EGAF</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

export { Welcome }