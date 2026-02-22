function templateEmail(): string{
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo à Academia Egaf!</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo à Academia Egaf!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            background-color: #ffffff;
            margin: 20px auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header img {
            width: 150px;
        }
        .content {
            line-height: 1.6;
            color: #333333;
        }
        .content h1 {
            color: #0056b3;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            background-color: #0056b3;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://www.academiaegaf.com.br/logo.png" alt="Logo da Academia Egaf">
        </div>
        <div class="content">
            <h1>Bem-vindo à Academia Egaf!</h1>
            <p>Estamos muito felizes em tê-lo conosco! Você acaba de dar um passo importante em sua jornada de aprendizado, e estamos aqui para apoiá-lo em cada etapa.</p>
            <p>Na Academia Egaf, oferecemos uma variedade de cursos projetados para ajudá-lo a alcançar seus objetivos educacionais e profissionais. Nossa plataforma é intuitiva e fácil de usar, garantindo que você tenha a melhor experiência possível.</p>
            <p>Para começar, faça login em sua conta e explore os cursos disponíveis. Se tiver alguma dúvida ou precisar de assistência, nossa equipe de suporte está pronta para ajudar.</p>
            <p>Mais uma vez, bem-vindo à nossa comunidade de aprendizado. Estamos ansiosos para vê-lo prosperar!</p>
            <p>Atenciosamente,<br>
            Equipe da Academia Egaf</p>
            <a href="https://www.academiaegaf.com.br/login" class="button">Acessar Minha Conta</a>
        </div>
        <div class="footer">
            <p>© 2025 Academia Egaf. Todos os direitos reservados.</p>
            <p>Você está recebendo este e-mail porque se cadastrou na Academia Egaf. Se não foi você, por favor, ignore este e-mail.</p>
        </div>
    </div>
</body>
</html>
`
}
export {templateEmail}