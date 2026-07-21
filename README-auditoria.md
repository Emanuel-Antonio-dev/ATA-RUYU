# 🥋 ATA-Ryu — Sistema de Gestão de Academias de BJJ

> Plataforma SaaS multi-tenant hierárquica para gestão de academias de Jiu-Jitsu Brasileiro.
> Desenvolvida para a rede **Aliança do Tatame** em Angola.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [O Problema que Resolve](#o-problema-que-resolve)
3. [Funcionalidades Principais](#funcionalidades-principais)
4. [Stack Técnica](#stack-técnica)
5. [Arquitectura](#arquitectura)
6. [Distribuição da App Desktop](#distribuição-da-app-desktop)
7. [Roles e Permissões](#roles-e-permissões)
8. [Modelo de Subscrição](#modelo-de-subscrição)
9. [Segurança e Multi-tenancy](#segurança-e-multi-tenancy)
10. [Segurança da App Desktop (Electron)](#segurança-da-app-desktop-electron)
11. [Começar a Usar](#começar-a-usar)
12. [Variáveis de Ambiente](#variáveis-de-ambiente)
13. [Pedido de Auditoria — Âmbito e Prioridades](#pedido-de-auditoria--âmbito-e-prioridades)
14. [Licença](#licença)

---

## Visão Geral

O **ATA-Ryu** é uma plataforma SaaS que permite a uma academia central de BJJ gerir toda a sua rede de afiliadas a partir de um único lugar. Cada afiliada opera num ambiente completamente isolado, enquanto a sede mantém visibilidade e controlo global sobre atletas, graduações, pagamentos e subscrições em toda a rede.

O nome *Ryu* (流) vem do japonês e significa **linhagem** ou **escola** — uma referência directa à estrutura hierárquica das academias de BJJ e à sua relação com a escola fundadora.

A plataforma é um monorepo com três aplicações:

- **`apps/api`** — NestJS + PostgreSQL (Prisma), backend multi-tenant.
- **`apps/desktop`** — Electron + React, app offline-first usada no dia a dia pelas academias.
- **`apps/landing`** — Next.js/React, site de distribuição onde as afiliadas validam a chave de activação física para descarregar a app.

---

## O Problema que Resolve

A falta de organização digital nas academias de artes marciais tem crescido nos últimos tempos. O Ryu foi construído para uma realidade diferente: **uma academia central que aprova, gere e monitoriza uma rede crescente de afiliadas**, cada uma com os seus próprios atletas, instrutores e operações financeiras — tudo sob o mesmo tecto.

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
- Registo de Graduações com métricas de presença e avaliações dos instrutores
- Controlo de mensalidades com alertas de pagamentos em atraso
- Gestão de inscrições em campeonatos

### 🥋 Gestão de Atletas
- Código de afiliação único e global por atleta (`ATA-00412`)
- Registo de faixa e grau nas 9 cores de faixa do BJJ
- Taxa de presença calculada automaticamente
- Histórico de pagamentos por atleta
- Histórico de graduações com avaliações dos instrutores

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Backend | Node.js · TypeScript · NestJS |
| Base de Dados | PostgreSQL · Prisma ORM |
| App Desktop | Electron · React · TypeScript · shadcn/ui · SQLite local (offline-first) |
| Site de Distribuição | Next.js/React (TanStack Start) · Tailwind CSS |
| Autenticação | JWT · Refresh Tokens · OTP / 2FA |
| Tipos Partilhados | Pacote TypeScript em monorepo (`packages/shared-types`) |

---

## Arquitectura

```
ATA-RUYU/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── app.config.ts
│   │   │   │   ├── database.config.ts
│   │   │   │   └── jwt.config.ts
│   │   │   │
│   │   │   ├── prisma/
│   │   │   │   └── schema.prisma
│   │   │   │
│   │   │   ├── common/
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
│   ├── desktop/                              # Electron + React (offline-first)
│   │   ├── electron/
│   │   │   ├── main.ts                       # processo principal
│   │   │   ├── preload.ts                    # contextBridge — única ponte renderer↔main
│   │   │   ├── ipc/
│   │   │   │   ├── handlers/                 # auth, athletes, attendance, payments,
│   │   │   │   │                             # graduations, championships, sync
│   │   │   │   └── channels.ts
│   │   │   ├── db/                           # cliente SQLite local + migrações
│   │   │   ├── sync/                         # sync-engine, sync-queue, conflict-resolver
│   │   │   ├── security/                     # token-store, activation
│   │   │   ├── updater/                      # electron-updater
│   │   │   └── services/
│   │   │       └── api-client.ts             # única camada que fala com o backend
│   │   └── src/
│   │       ├── app/
│   │       ├── pages/                        # Activation, Login, Dashboard, Athletes,
│   │       │                                 # Attendance, Graduations, Payments,
│   │       │                                 # Championships, Reports, Settings
│   │       ├── components/
│   │       ├── services/                     # wrappers IPC tipados
│   │       ├── hooks/
│   │       ├── stores/
│   │       └── lib/
│   │
│   └── landing/                              # site de distribuição/download
│       └── src/
│           ├── lib/
│           │   └── validate-key.functions.ts # createServerFn — validação da chave
│           └── pages/
│               └── download/
│
└── packages/
    └── shared-types/                         # tipos e DTOs partilhados
        ├── academy.types.ts
        ├── athlete.types.ts
        └── ...
```

---

## Distribuição da App Desktop

As academias afiliadas fazem o download do app desktop no site de distribuição **ATA-RUYU.com** inserindo uma **chave de download física entregue num envelope selado** na sede central — semelhante a um cartão pré-pago. A validação da chave corre num `createServerFn` do lado do servidor (formato `XXXX-XXXX-XXXX-XXXX`), com rate limiting por IP, comparação em tempo constante contra hashes SHA-256 e respostas genéricas em caso de falha (sem revelar o motivo).

---

## Roles e Permissões

| Role | Âmbito | Acesso |
|---|---|---|
| `CENTRAL` | Global | Acesso total a todas as academias e relatórios |
| `ADMIN_DEV` | Global | Administração técnica da plataforma |
| `AFFILIATE_ADMIN` | Academia própria | Gestão completa da sua academia |

---

## Modelo de Subscrição

As academias (CENTRAL e FILIAL) pagam uma mensalidade de **35.500 KZ** para manter o acesso à plataforma. Em caso de falta de pagamento:

1. Estado passa para `PAST_DUE`
2. Após 7 dias de período de graça → `SUSPENDED`
3. O acesso à app desktop é bloqueado ao nível do guard até a dívida ser regularizada

---

## Segurança e Multi-tenancy

- Todos os queries são obrigatoriamente filtrados por `academyId` — a Academia A nunca acede a dados da Academia B.
- Autenticação JWT com refresh tokens e 2FA opcional via OTP.
- Estado da subscrição da academia verificado ao nível do guard em cada request (`academy-status.guard.ts`).
- Log de auditoria completo de todas as acções críticas.

---

## Segurança da App Desktop (Electron)

A app desktop segue um modelo de defesa em profundidade, dado que corre em máquinas fora do controlo directo da equipa:

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` em todas as `BrowserWindow`.
- `preload.ts` expõe apenas funções tipadas e mínimas via `contextBridge` — nunca `ipcRenderer` directamente.
- Cada handler IPC valida payload (Zod) e a *role* da sessão no processo principal — a UI pode esconder botões, mas a autorização vive sempre no `main`.
- Tokens de acesso/refresh guardados no cofre nativo do SO (`safeStorage`/`keytar`), nunca em `localStorage` ou ficheiros em claro.
- Refresh token rotativo com deteção de reutilização.
- Base de dados SQLite local encriptada em repouso (`SQLCipher` ou equivalente).
- Sincronização offline-first via fila de operações pendentes (`sync_queue`), com resolução de conflitos documentada e `academyId` da instalação imutável (nunca aceite como input do renderer).
- Assinatura de código nos instaladores e verificação de assinatura/checksum no `electron-updater` antes de aplicar qualquer atualização.
- Log de auditoria local sincronizado com o backend assim que possível, e mecanismo de revogação remota de instalações/chaves.

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

---

## Pedido de Auditoria — Âmbito e Prioridades

Este README foi preparado para servir de contexto a um pedido de auditoria completa ao Claude. Ordem sugerida de prioridade:

### 1. Isolamento multi-tenant (crítico)
Confirmar que **todos** os repositórios/queries em `academies`, `athletes`, `payments`, `attendance`, `graduations` e `championships` filtram por `academyId` sem excepção — incluindo em relatórios agregados da Central, onde a agregação é intencional mas ainda deve respeitar permissões de role.

### 2. Guards de autenticação e autorização
`jwt-auth.guard.ts`, `roles.guard.ts` e `academy-status.guard.ts`: verificar aplicação consistente em todos os controllers, e que a suspensão `PAST_DUE` → `SUSPENDED` (7 dias de graça) é impossível de contornar via nenhuma rota.

### 3. Geração de chaves e códigos
`download-key.util.ts` e `affiliate-code.util.ts`: aleatoriedade criptograficamente segura, unicidade garantida, ausência de padrões previsíveis; consistência com o fluxo de validação já revisto no `apps/landing`.

### 4. Fluxo de validação de chave (API vs. landing)
Confirmar que o endpoint `download-keys` da API tem o mesmo rigor do `validate-key.functions.ts` do landing (rate limiting, hashes, timing-safe compare, sem fallback de demo em produção).

### 5. Camada de sincronização offline (desktop)
`sync-engine.ts`, `sync-queue.ts`, `conflict-resolver.ts`: lógica de resolução de conflitos, imutabilidade do `academyId` da instalação, tratamento de falhas parciais de sincronização.

### 6. Segurança do Electron
Confirmar `contextIsolation`/`sandbox`/`nodeIntegration` em todas as janelas, ausência de `remote` module, CSP estrita, e uso efectivo de `safeStorage`/`keytar` (não ficheiros JSON em claro) para tokens.

### 7. Cobertura de testes
`auth.e2e-spec.ts` e `athletes.e2e-spec.ts` existem — identificar módulos sem specs (`payments`, `subscriptions`, `championships`, `graduations`, `download-keys` parecem não ter testes listados) e avaliar risco.

### 8. Consistência de tipos partilhados
`packages/shared-types` vs. DTOs reais da API e da app desktop — risco comum em monorepos de tipos desactualizados face à implementação.

### 9. Implementação real do modelo de subscrição
Confirmar que a regra "7 dias de graça" está implementada exactamente assim no `subscriptions` module e que a suspensão é enforced no guard, não apenas assinalada na base de dados.

**Formato de relatório pedido ao Claude:** por cada ponto acima, indicar severidade (crítico/alto/médio/baixo), localização exacta no código (ficheiro + linha, quando aplicável), e recomendação concreta de correção.

---

## Licença

Privado — Todos os direitos reservados · Aliança do Tatame Angola · 2026
