# 🥋 ATA-Ryu — Sistema de Gestão de Academias de BJJ

> Plataforma SaaS multi-tenant hierárquica para gestão de academias de Jiu-Jitsu Brasileiro.  
> Desenvolvida para a rede **Aliança do Tatame** em Angola.

---

## Visão Geral

O **ATA-Ryu** é uma plataforma SaaS que permite a uma academia central de BJJ gerir toda a sua rede de afiliadas a partir de um único lugar. Cada afiliada opera num ambiente completamente isolado, enquanto a sede mantém visibilidade e controlo global sobre atletas, graduações, pagamentos e subscrições em toda a rede.

O nome *Ryu* (流) vem do japonês e significa **linhagem** ou **escola** — uma referência directa à estrutura hierárquica das academias de BJJ e à sua relação com a escola fundadora.

---

## O Problema que Resolve

A falta de organização digital nas academias de artes marciais tem crescido nos últimos tempos.O Ryu foi construído para uma realidade diferente: **uma academia central que aprova, gere e monitoriza uma rede crescente de afiliadas**, cada uma com os seus próprios atletas, instrutores e operações financeiras — tudo sob o mesmo tecto.

---

## Funcionalidades Principais

### 🏛️ Sede Central (Super Admin)
- Aprovar ou rejeitar pedidos de adesão de academias afiliadas
- Gerar números de afiliado sequenciais (`ATA-0042`)
- Emitir chaves de activação físicas (`XXXX-XXXX-XXXX-XXXX`) para download da app desktop
- Monitorizar todas as afiliadas
- Suspender ou reactivar academias
- Relatórios globais de toda a rede

### 🏫 Academias Afiliadas
- Gestão completa do ciclo de vida dos atletas (registo, perfil, faixas)
- Marcação de presenças por aula com suporte a marcação em massa
- Registro de Graduações com métricas de presença e avaliações dos instrutores
- Controlo de mensalidades com alertas de pagamentos em atraso
- Gestão de inscrições em campeonatos

### 🥋 Gestão de Atletas
- Código de afiliação único e global por atleta (`ATA-00412`)
- Registo de faixa e grau nas 9 cores de faixa do BJJ
- Taxa de presença calculada automaticamente
- Histórico de pagamentos por atleta
- Histórico de graduações com avaliações dos instrutores

### 🔐 Segurança e Multi-tenancy
- Todos os queries são obrigatoriamente filtrados por `academyId` — a Academia A nunca acede a dados da Academia B
- Autenticação JWT com refresh tokens e 2FA opcional via OTP
- Estado da subscrição da academia verificado ao nível do guard em cada request
- Log de auditoria completo de todas as acções críticas

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Backend | Node.js · TypeScript · NestJS |
| Base de Dados | PostgreSQL · Prisma ORM |
| App Desktop | Electron/Tauri · React/Next · shadcn/ui |
| Site de Download | React/Next · Tailwind CSS |
| Autenticação | JWT · Refresh Tokens · OTP / 2FA |
| Tipos Partilhados | Pacote TypeScript em monorepo |

---

## Arquitectura

```
ATA-RUYU/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   │
│   │   │   ├── config/                       # variáveis de ambiente e configurações globais
│   │   │   │   ├── app.config.ts
│   │   │   │   ├── database.config.ts
│   │   │   │   └── jwt.config.ts
│   │   │   │
│   │   │   ├── prisma/                       # módulo global do Prisma
│   │   │   │   └── schema.prisma
│   │   │   │
│   │   │   ├── common/                       # partilhado por todos os módulos
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   └── current-academy.decorator.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   ├── roles.guard.ts
│   │   │   │   │   └── academy-status.guard.ts   # bloqueia se subscrição suspensa
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   └── utils/
│   │   │   │       ├── affiliate-code.util.ts    # geração do código do atleta
│   │   │   │       ├── download-key.util.ts      # geração da chave XXXX-XXXX-XXXX-XXXX
│   │   │   │       └── pagination.util.ts
│   │   │   │
│   │   │   └── modules/
│   │   │       │
│   │   │       ├── auth/
│   │   │       │   ├── auth.module.ts
│   │   │       │   ├── auth.controller.ts
│   │   │       │   ├── auth.service.ts
│   │   │       │   ├── strategies/
│   │   │       │   │   ├── jwt.strategy.ts
│   │   │       │   │   └── refresh.strategy.ts
│   │   │       │   └── dto/
│   │   │       │       ├── login.dto.ts
│   │   │       │       ├── refresh-token.dto.ts
│   │   │       │       ├── verify-otp.dto.ts
│   │   │       │       └── reset-password.dto.ts
│   │   │       │
│   │   │       ├── academies/
│   │   │       │   ├── academies.module.ts
│   │   │       │   ├── academies.controller.ts
│   │   │       │   ├── academies.service.ts
│   │   │       │   ├── academies.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-academy.dto.ts
│   │   │       │       ├── update-academy.dto.ts
│   │   │       │       └── approve-academy.dto.ts
│   │   │       │
│   │   │       ├── users/
│   │   │       │   ├── users.module.ts
│   │   │       │   ├── users.controller.ts
│   │   │       │   ├── users.service.ts
│   │   │       │   ├── users.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-user.dto.ts
│   │   │       │       └── update-user.dto.ts
│   │   │       │
│   │   │       ├── athletes/
│   │   │       │   ├── athletes.module.ts
│   │   │       │   ├── athletes.controller.ts
│   │   │       │   ├── athletes.service.ts
│   │   │       │   ├── athletes.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-athlete.dto.ts
│   │   │       │       └── update-athlete.dto.ts
│   │   │       │
│   │   │       ├── payments/
│   │   │       │   ├── payments.module.ts
│   │   │       │   ├── payments.controller.ts
│   │   │       │   ├── payments.service.ts
│   │   │       │   ├── payments.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-payment.dto.ts
│   │   │       │       └── update-payment.dto.ts
│   │   │       │
│   │   │       ├── subscriptions/
│   │   │       │   ├── subscriptions.module.ts
│   │   │       │   ├── subscriptions.controller.ts
│   │   │       │   ├── subscriptions.service.ts
│   │   │       │   ├── subscriptions.repository.ts
│   │   │       │   └── dto/
│   │   │       │       └── update-subscription.dto.ts
│   │   │       │
│   │   │       ├── attendance/
│   │   │       │   ├── attendance.module.ts
│   │   │       │   ├── attendance.controller.ts
│   │   │       │   ├── attendance.service.ts
│   │   │       │   ├── attendance.repository.ts
│   │   │       │   └── dto/
│   │   │       │       └── mark-attendance.dto.ts
│   │   │       │
│   │   │       ├── graduations/
│   │   │       │   ├── graduations.module.ts
│   │   │       │   ├── graduations.controller.ts
│   │   │       │   ├── graduations.service.ts
│   │   │       │   ├── graduations.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-graduation-event.dto.ts
│   │   │       │       ├── create-graduation.dto.ts
│   │   │       │       └── create-review.dto.ts
│   │   │       │
│   │   │       ├── championships/
│   │   │       │   ├── championships.module.ts
│   │   │       │   ├── championships.controller.ts
│   │   │       │   ├── championships.service.ts
│   │   │       │   ├── championships.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-championship.dto.ts
│   │   │       │       └── register-athlete.dto.ts
│   │   │       │
│   │   │       ├── download-keys/
│   │   │       │   ├── download-keys.module.ts
│   │   │       │   ├── download-keys.controller.ts
│   │   │       │   ├── download-keys.service.ts
│   │   │       │   └── dto/
│   │   │       │       └── validate-key.dto.ts
│   │   │       │
│   │   │       └── reports/                      # exclusivo da central
│   │   │           ├── reports.module.ts
│   │   │           ├── reports.controller.ts
│   │   │           └── reports.service.ts
│   │   │
│   │   └── test/
│   │       ├── auth.e2e-spec.ts
│   │       └── athletes.e2e-spec.ts
│   │
│   ├── desktop/                              # Electron + React
│   │   ├── electron/
│   │   │   ├── main.ts                       # processo principal
│   │   │   └── preload.ts
│   │   └── src/
│   │       ├── pages/
│   │       ├── components/
│   │       └── services/                     # chamadas à API
│   │
│   └── landing/                              # site de download
│       └── src/
│           └── pages/
│               └── download/                 # validação da chave
│
└── packages/
    └── shared-types/                         # tipos e DTOs partilhados
        ├── academy.types.ts
        ├── athlete.types.ts
        └── ...
```


### Distribuição da App Desktop

As academias afiliadas fazem o download do app desktop no site de distribuição **ATA-RUYU.com** inserindo uma **chave de download física entregue num envelope selado** na sede central — semelhante a um cartão pré-pago. 
---


## Roles e Permissões

| Role | Âmbito | Acesso |
|---|---|---|
| `CENTRAL` | Global | Acesso total a todas as academias e relatórios |
| `ADMIN_DEV` | Global | Administração técnica da plataforma |
| `AFFILIATE_ADMIN` | Academia própria | Gestão completa da sua academia |

---

## Modelo de Subscrição

As academias(CENTRAL E FILIAL) pagam uma mensalidade de **35.500 KZ** para manter o acesso à plataforma. Em caso de falta de pagamento:

1. Estado passa para `PAST_DUE`
2. Após 7 dias de período de graça → `SUSPENDED`
3. O acesso à app desktop é bloqueado ao nível do guard até a dívida ser regularizada

---

## Começar a Usar

```bash
# Clonar o repositório
git clone https://github.com/Emanuel-Antonio-dev/ATA-RUYU
cd ATA-RUYU

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp apps/api/.env.example apps/api/.env

# Executar as migrações da base de dados
cd apps/api
npx prisma migrate dev

# Arrancar a API
npm run start:dev

# Arrancar a app desktop (desenvolvimento)
cd ../desktop
npm run dev
```

---

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ryu
JWT_SECRET=o-teu-jwt-secret
JWT_REFRESH_SECRET=o-teu-refresh-secret
APP_DOWNLOAD_URL=https://cdn.exemplo.ao/ryu-setup.exe
```

## Licença

Privado — Todos os direitos reservados · Aliança do Tatame Angola · 2026
