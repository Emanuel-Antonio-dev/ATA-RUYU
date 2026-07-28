# 🔍 Auditoria Técnica — ATA-Ryu API

**Projecto:** `ata-gestao` — Backend NestJS da plataforma ATA-Ryu (gestão multi-tenant de academias de BJJ)
**Data da auditoria:** 28 de Julho de 2026
**Commit auditado:** `ad6a174` (branch `master`)
**Âmbito:** `src/` (161 ficheiros, ~9.100 LOC), `prisma/`, configuração de build e deploy
**Método:** Análise estática do código-fonte, revisão de fluxos de autenticação/autorização, modelo de dados e configuração de segurança.

> ⚠️ **Nota metodológica:** `node_modules/` não está instalado no ambiente auditado, pelo que não foi possível executar `tsc`, testes ou a aplicação. Todos os achados abaixo resultam de leitura directa do código. Os que envolvem erros de compilação estão assinalados como tal e devem ser confirmados com `pnpm install && pnpm run build`.

---

## Índice

1. [Sumário Executivo](#1-sumário-executivo)
2. [Pontos Positivos](#2-pontos-positivos)
3. [Vulnerabilidades de Segurança](#3-vulnerabilidades-de-segurança)
4. [Bugs Funcionais](#4-bugs-funcionais)
5. [Pontos Negativos — Arquitectura e Qualidade](#5-pontos-negativos--arquitectura-e-qualidade)
6. [Plano de Correcção Priorizado](#6-plano-de-correcção-priorizado)
7. [Melhorias Recomendadas a Médio Prazo](#7-melhorias-recomendadas-a-médio-prazo)
8. [Anexo — Matriz de Endpoints e Isolamento](#8-anexo--matriz-de-endpoints-e-isolamento)

---

## 1. Sumário Executivo

O ATA-Ryu tem uma **base arquitectural sólida**: separação limpa por módulos, padrão repositório com interfaces, schema Prisma bem modelado e validação global de entrada. A intenção de segurança está visível em vários pontos (bcrypt, 2FA, hashing de chaves de download, verificações de tenant em alguns módulos).

O problema não é a arquitectura — é a **aplicação inconsistente dessa arquitectura**. As verificações de isolamento multi-tenant existem em cerca de metade dos módulos e faltam por completo na outra metade, incluindo nos endpoints que expõem mais dados pessoais e nos que controlam receita. Adicionalmente, `helmet`, `express-rate-limit`, `compression` e `@nestjs/config` estão instalados no `package.json` mas **nunca são usados no código**.

### Veredicto

| Dimensão | Nota | Comentário |
|---|---|---|
| Arquitectura e organização | 🟢 8/10 | Modular, previsível, escalável em estrutura |
| Modelo de dados (Prisma) | 🟢 8/10 | Bem normalizado, índices e cascatas correctos |
| Segurança | 🔴 2/10 | Falhas críticas de isolamento e exposição de dados |
| Correcção funcional | 🔴 3/10 | Fluxos centrais provavelmente partidos (login, reset de senha) |
| Testes | 🔴 0/10 | Zero testes escritos |
| Observabilidade | 🔴 2/10 | `console.log`, sem logger estruturado, `AuditLog` nunca escrito |
| Prontidão para produção | 🔴 **Não apto** | Ver §6 |

### Números

- **161** ficheiros TypeScript, **~9.100** linhas
- **0** testes (`jest` configurado, nenhum `.spec.ts` existe)
- **62** chamadas a `console.log` / `console.error` em código de produção
- **4** dependências de segurança/config instaladas e não utilizadas
- **11** achados críticos ou altos
- **1** modelo de base de dados (`AuditLog`) definido e nunca escrito

---

## 2. Pontos Positivos

Vale registar o que está bem feito — é sobre esta base que as correcções assentam.

### 2.1 Arquitectura modular coerente

A estrutura `Modules/<Domínio>/{Controllers,Services,Repositories,Dtos}` é consistente em todo o projecto, com **um ficheiro por caso de uso** (`register-athlete.service.ts`, `set-graduation-status.service.ts`). Isto torna o código navegável e localiza o impacto de cada alteração.

### 2.2 Padrão repositório com inversão de dependência

Cada domínio define uma interface abstracta (`IAcademiesRepositories`) usada como token de DI e uma implementação Prisma:

```ts
// src/Modules/Subscriptions/subscriptions.module.ts:29
{ useClass: PrismaSubscriptionRepository, provide: ISubscriptionRepository }
```

Os serviços dependem da abstracção. Isto permite trocar o ORM e — sobretudo — **mockar repositórios em testes** sem tocar na base de dados.

### 2.3 Schema Prisma bem desenhado

[prisma/schema.prisma](prisma/schema.prisma) é o artefacto mais maduro do projecto:

- Enums para todos os estados de domínio (`BeltColor`, `SubscriptionStatus`, `GraduationStatus`)
- Índices deliberados nos caminhos de consulta reais: `@@index([subscriptionId, status])`, `@@index([academyId, classDate])`, `@@index([dueDate])`
- `onDelete: Cascade` coerente em toda a árvore de relações
- `Decimal @db.Decimal(12, 2)` para valores monetários — **correcto**, evita erros de vírgula flutuante em dinheiro
- `@@unique([athleteId, classDate])` impede presença duplicada ao nível da BD
- Convenção de nomes de tabela via `@@map("tbl_...")`

### 2.4 Validação global de entrada

[src/main.ts:38-51](src/main.ts#L38-L51) configura o `ValidationPipe` com `whitelist: true` e `transform: true`. O `whitelist` remove propriedades não declaradas nos DTOs, o que **elimina a classe de ataques de mass assignment** — uma protecção que muitos projectos esquecem.

### 2.5 Filtro global de excepções com envelope normalizado

[src/Common/Filters/http-exception.ts](src/Common/Filters/http-exception.ts) trata `HttpException`, `MulterError` e erros genéricos, devolvendo sempre `{ statusCode, success, timestamp, message }`. Os clientes têm um contrato de erro previsível.

### 2.6 Fundamentos criptográficos correctos nos pontos certos

- Senhas com `bcrypt` (custo 12 no registo)
- Códigos OTP **hasheados** na base de dados, com contador de tentativas e bloqueio (`attempts`, `maxAttempts`, `locked`)
- Chaves de download hasheadas com SHA-256 antes de persistir ([generate-codes.ts:22](src/Common/Utils/generate-codes.ts#L22))
- `generateDownloadKey()` usa `randomBytes` com charset sem caracteres ambíguos — ~100 bits de entropia, desenho sólido
- `randomInt` (CSPRNG) na geração de OTP
- **Zero `$queryRaw` / `$executeRaw`** em todo o código — não há superfície de SQL injection

### 2.7 Transacções em operações multi-passo

Escritas compostas usam `prisma.$transaction`, com propagação correcta do cliente transaccional (`tx`) até ao repositório:

```ts
// src/Modules/Academies/Services/register-academy.service.ts:58
const transaction = await this.prisma.$transaction(async (tx) => {
  const account = await this.accountsService.registerAccount({...}, tx)
  const academy = await this.repositoy.createAcademy({...}, tx)
})
```

### 2.8 Isolamento multi-tenant implementado (onde existe)

Os módulos de Presenças, Graduações, Pagamentos de Atletas e edição/remoção de Academias **verificam a posse do recurso**:

```ts
// src/Modules/Attendance/Service/mark-attendance.service.ts:36
if (credentials?.sub !== existsAthele.academy.id) {
  throw new UnauthorizedException("Você não tem permissão para marcar a presença de um atleta de outra academia")
}
```

O padrão está correcto. O problema é ser aplicado apenas em parte do sistema (ver §3.1).

### 2.9 Ciclo de vida de subscrições automatizado

Os três cron jobs ([expire](src/Common/Jobs/expire-subscriptions.cron.ts), [mark-overdue](src/Common/Jobs/mark-overdue-payments.cron.ts), [suspend](src/Common/Jobs/suspend-overdue-subscriptions.cron.ts)) estão bem escritos: horários escalonados para respeitar dependências, `Promise.allSettled` para que uma falha não aborte o lote, período de tolerância explícito (`GRACE_DAYS = 7`) e logging por academia afectada.

### 2.10 Camada de cache com invalidação por padrão

[CacheService](src/Modules/Cache/cache.service.ts) oferece `getOrSet`, invalidação por prefixo e métodos de domínio (`invalidateAcademy`, `invalidateSubscription`). O desenho da API é bom — a limitação está no backend escolhido (ver §5.6).

### 2.11 Documentação Swagger e mensagens ao utilizador

Quase todos os endpoints têm `@ApiOperation`, `@ApiResponse` e exemplos. As mensagens de erro estão em português consistente e são adequadas ao utilizador final ("Credenciais inválidas", "Aguarde a aprovação da Central") — não expõem detalhes técnicos.

### 2.12 Migrações versionadas e sanitização de texto

Migrações Prisma sob controlo de versões, e `sanitize-html` aplicado a campos de texto livre antes da persistência.

---

## 3. Vulnerabilidades de Segurança

Classificação: **🔴 CRÍTICA** (exploração trivial, impacto grave) · **🟠 ALTA** · **🟡 MÉDIA** · **🔵 BAIXA**

---

### 🔴 V-01 — Exposição pública de toda a base de dados de pessoas

**Ficheiros:** [get-all-academies.controller.ts:16](src/Modules/Academies/Controllers/get-all-academies.controller.ts#L16) · [prisma-academies-repositories.ts:140-228](src/Modules/Academies/Repositories/Prisma/prisma-academies-repositories.ts#L140-L228)

O endpoint `GET /api.ata-ruyus/v1/academies` está marcado `@PublicRoute()` — sem autenticação. A consulta subjacente devolve, para **todas** as academias da rede:

- Email, telefone e estado da conta de cada academia
- Para **cada atleta**: nome completo, data de nascimento, email, telefone, **telefone de emergência**, fotografia, código de afiliação
- Histórico completo de **pagamentos** (valores, datas, estado)
- Histórico completo de **presenças**
- Histórico completo de **graduações**
- Dados de **subscrição** (valores, períodos)

Agrava-se com o facto de o parâmetro `limit` não ter tecto:

```ts
// get-all-academies.controller.ts:35
limit: limit ? Number(limit) : 20,
```

**Exploração:**
```bash
curl "https://<host>/api.ata-ruyus/v1/academies?limit=999999"
```
Um pedido HTTP não autenticado extrai a base de dados inteira de menores de idade e adultos inscritos na rede. Não é preciso conta, token ou qualquer conhecimento prévio.

**Impacto:** Fuga massiva de dados pessoais, incluindo de menores. Risco legal, contratual e reputacional directo. O mesmo pedido, repetido, é também um vector de negação de serviço — o resultado é escrito no cache em memória do processo (§5.6), esgotando a RAM.

**Correcção:**
1. Remover `@PublicRoute()` deste endpoint.
2. Impor tecto no `limit` (`Math.min(Number(limit) || 20, 100)`).
3. Criar duas projecções distintas no repositório: um `select` mínimo (`id`, `name`, `city`, `province`, `logoUrl`, `status`) para listagens, e a projecção completa apenas para o dono da academia ou para a CENTRAL.
4. **Nunca** incluir a colecção `athletes` numa listagem de academias — deve ser um endpoint paginado próprio.

---

### 🔴 V-02 — IDOR: qualquer academia lê os atletas de qualquer outra

**Ficheiros:** [get-atheletes-datas-by-id.service.ts:14-20](src/Modules/Users/Atheles/Services/get-atheletes-datas-by-id.service.ts#L14-L20) · [get-athelete-datas.controller.ts:30-42](src/Modules/Users/Atheles/Controllers/get-athelete-datas.controller.ts#L30-L42)

O serviço **recebe** as credenciais e **nunca as usa**:

```ts
async get(id: string, credentials?: { sub: string; role: Role }) {
  if (!id) throw new NotFoundException("Informe o(a) atleta.");
  const athelete = await this.repository.getAthleteDatas(id);   // ← sem filtro de academia
  if (!athelete) throw new NotFoundException("Atleta não encontrado(a).");
  return { success: true, statusCode: 200, datas: athelete };
}
```

O contraste com [delete-athelete-datas.service.ts:22](src/Modules/Users/Atheles/Services/delete-athelete-datas.service.ts#L22), que faz a verificação correctamente, mostra que a omissão é acidental — não uma decisão de desenho.

Afecta três endpoints:

| Endpoint | Problema |
|---|---|
| `GET /athletes/:id` | Lê qualquer atleta da rede por ID |
| `GET /athletes/:code/affiliate-code` | Lê qualquer atleta por código de afiliação |
| `GET /athletes?academyId=<outra>` | **O `academyId` vem da query string, não do token** — lista os atletas de qualquer academia; omitindo o parâmetro, lista **todos os atletas da plataforma** |

**Agravante:** o código de afiliação é gerado por `generateAffiliateNumber()`, que produz apenas **9.000 valores possíveis** (ver B-09). Um atacante autenticado enumera o espaço completo em segundos e recolhe o cadastro integral da rede.

**Correcção:** derivar sempre o `academyId` de `credentials.sub`, nunca da query. A CENTRAL, se precisar de acesso global, deve passar por um ramo explícito e auditado:

```ts
const scopeAcademyId = credentials.role === Role.CENTRAL
  ? (query.academyId ?? undefined)   // CENTRAL pode escolher
  : credentials.sub;                  // afiliada fica presa à sua academia
```

---

### 🔴 V-03 — Fraude de subscrição: activação e renovação sem pagamento

**Ficheiros:** [Subscription.controller.ts:51-109](src/Modules/Subscriptions/Controllers/Subscription.controller.ts#L51-L109) · [register-payment.service.ts](src/Modules/Subscriptions/Services/register-payment.service.ts) · [renew-subscription.service.ts](src/Modules/Subscriptions/Services/renew-subscription.service.ts)

**Nenhum** endpoint de subscrições verifica se a subscrição pertence a quem faz o pedido. E `Role.AFFILIATE` tem acesso a operações que deviam ser exclusivas da CENTRAL.

**(a) Auto-declaração de pagamento** — `POST /subscriptions/payments`, permitido a `AFFILIATE`:

```ts
// register-payment.service.ts:55-79
const payment = await this.paymentRepo.register({
  subscriptionId: dto.subscriptionId,       // ← vem do corpo, não validado contra o tenant
  amount: Number(process.env.SUBSCRIPTION_AMOUNT_AOA),
  paidAt: new Date(),                        // ← marcado como pago, sem qualquer verificação
});

if (subscription.status === SubscriptionStatus.PAST_DUE) {
  await this.subscriptionRepo.updateStatus(subscription.id, SubscriptionStatus.ACTIVE);
}
```

Uma afiliada suspensa por falta de pagamento faz um `POST` e **reactiva-se sozinha**. Não existe integração com gateway, comprovativo, nem confirmação humana neste caminho.

**(b) Renovação gratuita e ilimitada** — `PATCH /subscriptions/:id/renew`, permitido a `AFFILIATE`:

```ts
// renew-subscription.service.ts:31-38
const newEnd = new Date(newStart);
newEnd.setMonth(newEnd.getMonth() + 1);      // +1 mês, sem cobrar nada
await this.subscriptionRepo.renewPeriod(subscriptionId, newStart, newEnd);
```

Chamado em ciclo, mantém a subscrição activa indefinidamente sem custo.

**(c) Sabotagem entre concorrentes** — `PATCH /subscriptions/:id/cancel`, permitido a `AFFILIATE`, sem verificação de posse: qualquer afiliada cancela a subscrição de outra, o que (via cron de suspensão) leva à **suspensão da academia rival**.

**Impacto:** perda directa de receita, corrupção de dados financeiros e sabotagem entre tenants.

**Correcção:**
1. `register-payment`, `renew` e `confirm` passam a ser exclusivos de `CENTRAL` / `ADMIN_DEV`.
2. Adicionar verificação de posse em todos os serviços: carregar a subscrição, comparar `subscription.academyId` com `credentials.sub`, lançar `ForbiddenException` se divergir.
3. A transição para `ACTIVE` só pode ocorrer via `ConfirmSubscriptionPaymentService` (já restrito a `ADMIN_DEV`) — remover a mudança de estado de `register-payment`.
4. Separar `PENDING` de `PAID`: `register-payment` não deve preencher `paidAt`.

---

### 🔴 V-04 — Confusão de tipos de token JWT

**Ficheiros:** [operations.ts:12-23](src/Common/Utils/AuthenticationsProcols/JwtOperations/operations.ts#L12-L23) · [jwt-auth.guard.ts:40](src/Modules/Auth/Guards/jwt-auth.guard.ts#L40)

Os três tipos de token são assinados com o **mesmo segredo** e **payload idêntico**, distinguindo-se apenas pela expiração:

```ts
if (type === "temp")         return jwt.sign(payload, secret, {expiresIn:"1h"})
else if (type === "refreshToken") return jwt.sign(payload, secret, {expiresIn:"7d"})
return jwt.sign(payload, secret, {expiresIn:"15min"})
```

O guard valida apenas a assinatura:

```ts
const payload = await jwt.verify(token, process.env.JWT_SECRET as string)
request.credentials = payload
return true
```

**Consequência:** um *refresh token* enviado em `Authorization: Bearer <refresh>` é aceite como token de acesso. O tempo de vida do acesso deixa de ser 15 minutos e passa a **7 dias** — anulando o propósito do desenho de tokens curtos. O mesmo vale para o token temporário de 1 hora.

**Correcção:** incluir uma claim `typ` no payload e exigi-la no guard:

```ts
// Ao gerar
jwt.sign({ ...payload, typ: 'access' }, secret, { expiresIn: '15m' })

// No guard
const payload = jwt.verify(token, secret) as JwtPayload;
if (payload.typ !== 'access') throw new UnauthorizedException('Token inválido.');
```

Idealmente, usar segredos distintos para acesso e refresh, e adicionar `issuer`/`audience`.

---

### 🔴 V-05 — Colisão de espaços de identificadores e de papéis no token

**Ficheiro:** [signin.service.ts:51-63](src/Modules/Auth/Services/signin.service.ts#L51-L63)

A mesma claim `sub` transporta entidades diferentes consoante o tipo de conta:

```ts
if (account.academy) {
  payload = { sub: account.academy.id, role: account.academy.type }   // sub = ID de ACADEMIA, role ∈ {CENTRAL, AFFILIATE}
} else if (account.user) {
  payload = { sub: account.user.id, role: account.user.role }         // sub = ID de UTILIZADOR, role ∈ {CENTRAL, ADMIN_DEV, ...}
}
```

Dois problemas encadeados:

1. **`sub` é ambíguo.** Todo o código de autorização assume `credentials.sub === academyId` (`if (credentials?.sub !== athlete.academy.id)`). Para um token de utilizador, `sub` é um `User.id` — a comparação falha sempre, e utilizadores legítimos (`INSTRUCTOR`, `MASTER`, `AFFILIATE_ADMIN`) ficam sem acesso a nada.

2. **O valor `CENTRAL` existe nos dois enums** — em `AcademyType` e em `UserRole`. O `RolesGuard` compara strings sem saber a origem, pelo que um token emitido para uma *academia* de tipo `CENTRAL` satisfaz um `@Roles(Role.CENTRAL)` destinado a um *utilizador* administrador da central, e vice-versa.

Consequência prática adicional: como `sub` é sempre o ID da própria academia, a **CENTRAL não consegue gerir as afiliadas** — `GET /academies/:id` de outra academia devolve 403, apesar de `@Roles(Role.CENTRAL)` sugerir que pode. O modelo de permissões está internamente contraditório.

**Correcção:** padronizar um payload único e explícito:

```ts
type JwtPayload = {
  sub: string;          // sempre o accountId
  academyId: string;    // sempre o tenant
  role: Role;           // proveniente de um único enum
  typ: 'access' | 'refresh';
}
```

Substituir todas as comparações `credentials.sub !== X.academyId` por `credentials.academyId !== X.academyId`, e adicionar um bypass explícito para `CENTRAL`.

---

### 🟠 V-06 — XSS armazenado através de uploads

**Ficheiros:** [multer-config.ts:57-61](src/Common/Utils/multer-config.ts#L57-L61) · [main.ts:35-36](src/main.ts#L35-L36)

A extensão do ficheiro é copiada do nome enviado pelo cliente, sem lista branca:

```ts
filename: (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();   // ← controlado pelo atacante
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  cb(null, uniqueName);
}
```

O único filtro é sobre `file.mimetype` — cabeçalho que o cliente também controla. E a pasta é servida como estática na mesma origem:

```ts
app.use('/uploads', express.static(uploadsPath));
```

**Exploração:** enviar `payload.html` (ou `.svg`, explicitamente permitido para `AcademyLogos`) declarando `Content-Type: image/png`. O ficheiro é gravado como `1753...-123.html` e servido em `https://<host>/uploads/AcademyLogos/1753...-123.html` com `Content-Type: text/html`. O JavaScript executa na origem da aplicação — com acesso a cookies e a `localStorage` de sessões activas.

**Correcção:**
1. Lista branca de extensões, derivada do MIME validado — nunca de `originalname`.
2. Validar o *magic number* do ficheiro (`file-type`), não o cabeçalho declarado.
3. Remover `image/svg+xml` das extensões permitidas, ou servir SVG sempre com `Content-Disposition: attachment`.
4. Servir `/uploads` com `X-Content-Type-Options: nosniff` e, de preferência, a partir de um domínio/bucket separado (Cloudinary já está instalado — ver §5.7).

---

### 🟠 V-07 — Validação de certificado TLS desactivada no SMTP

**Ficheiro:** [email-sender.ts:20-22](src/Modules/Emails/email-sender.ts#L20-L22)

```ts
tls: {
  rejectUnauthorized: false,
}
```

Aceita qualquer certificado, incluindo auto-assinado. Um atacante em posição de rede intercepta a ligação SMTP e lê **os emails de recuperação de senha** — que transportam o token de reposição em claro. Isto transforma um MITM passivo em tomada de conta.

**Correcção:** remover a opção. Se um servidor interno exigir certificado próprio, fornecer o CA via `tls.ca` em vez de desactivar a verificação.

---

### 🟠 V-08 — Ausência total de rate limiting

**Ficheiros:** [main.ts](src/main.ts) · [package.json:54](package.json#L54)

`express-rate-limit@8.2.1` e `helmet@8.1.0` constam das dependências. Uma pesquisa em `src/` confirma que **nenhum dos dois é importado ou usado**. Não existe `ThrottlerModule`. Nenhum endpoint tem limite de tentativas.

Fica exposto:

| Endpoint | Ataque viável |
|---|---|
| `POST /auth/signin` | Credential stuffing e força bruta ilimitados |
| `POST /auth/otp/verify` | OTP de 4 dígitos (10.000 hipóteses) — o bloqueio por tentativas é contornado pedindo novo código |
| `POST /auth/password/request` | Bombardeamento de email e enumeração de contas (V-09) |
| `POST /academies` | Criação massiva de academias (endpoint público) |
| `GET /academies` | Extracção repetida da BD completa (V-01) |

A falta do `helmet` significa ainda ausência de `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` e `Content-Security-Policy` — cabeçalhos que mitigariam parcialmente V-06.

**Correcção:** em [main.ts](src/main.ts), antes do `listen`:

```ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

app.use(helmet());
app.use(compression());
app.use(rateLimit({ windowMs: 60_000, max: 100 }));            // limite global
app.use('/api.ata-ruyus/v1/auth', rateLimit({ windowMs: 900_000, max: 10 }));  // limite apertado no auth
```

---

### 🟠 V-09 — Cadeia de falhas na recuperação de senha

**Ficheiros:** [request-new-password.service.ts](src/Modules/Auth/Services/request-new-password.service.ts) · [reset-password.service.ts](src/Modules/Auth/Services/reset-password.service.ts)

Quatro problemas no mesmo fluxo:

**(a) Enumeração de contas** — [linha 30](src/Modules/Auth/Services/request-new-password.service.ts#L30):
```ts
if (!existsAccount) throw new NotFoundException("Não conseguimos encontrar esta conta.")
```
Respostas distintas para email existente e inexistente. Combinado com V-08, permite mapear todos os emails registados. Deve responder sempre com a mesma mensagem de sucesso.

**(b) Token de reposição guardado em claro** — [linha 44](src/Modules/Auth/Services/request-new-password.service.ts#L44): o `randomBytes(32).toString("hex")` é persistido tal e qual em `tbl_tokens.token`. Qualquer leitura da BD (backup, SQL injection noutro sistema, acesso de operador) permite tomar contas. Deve guardar-se `sha256(token)` e comparar o hash — exactamente como já é feito, correctamente, para as chaves de download.

**(c) Fuga condicional do token na resposta** — [linha 56](src/Modules/Auth/Services/request-new-password.service.ts#L56):
```ts
...(process.env.NODE_ENV == "test" ? { token: restPasswordToken } : {})
```
O token de reposição vai no corpo da resposta HTTP quando `NODE_ENV === "test"`. Uma variável de ambiente mal configurada em produção converte-se em tomada de conta trivial para qualquer email. Este atalho pertence aos testes, não ao código de produção.

**(d) Sessões sobrevivem à mudança de senha** — [reset-password.service.ts:29-31](src/Modules/Auth/Services/reset-password.service.ts#L29-L31): a senha é actualizada e o token de reposição apagado, mas **os refresh tokens existentes não são invalidados**. Um atacante que já tenha uma sessão mantém o acesso durante 7 dias, mesmo depois de a vítima mudar a senha — o gesto exacto que se espera que corte o acesso.

**Correcção (d):**
```ts
await tx.authentication.updateMany({
  where: { accountId, used: false },
  data:  { used: true },
});
```

---

### 🟡 V-10 — CORS permissivo com credenciais

**Ficheiro:** [main.ts:53-58](src/main.ts#L53-L58)

```ts
app.enableCors({
  origin: true,        // reflecte qualquer Origin recebida
  credentials: true,
})
```

`origin: true` devolve no `Access-Control-Allow-Origin` a origem do pedido, seja ela qual for. Com `credentials: true`, qualquer sítio na Internet passa a poder fazer pedidos autenticados por cookie em nome de um utilizador com sessão activa. Actualmente o impacto é limitado (os tokens circulam no cabeçalho `Authorization`, não em cookies), mas `cookie-parser` está instalado e o risco concretiza-se assim que houver autenticação por cookie.

**Correcção:** lista branca explícita via variável de ambiente.

```ts
origin: process.env.CORS_ORIGINS?.split(',') ?? false,
```

---

### 🟡 V-11 — Documentação Swagger pública em produção

**Ficheiro:** [main.ts:32-33](src/main.ts#L32-L33)

`/api.ata-ruyus/v1/docs` é montado incondicionalmente. Em produção, entrega a qualquer visitante o mapa completo da API: rotas, DTOs, papéis e exemplos. Não é uma vulnerabilidade por si, mas reduz drasticamente o esforço de reconhecimento para explorar V-01, V-02 e V-03.

**Correcção:** `if (process.env.NODE_ENV !== 'production') { SwaggerModule.setup(...) }`, ou proteger com autenticação básica.

---

### 🟡 V-12 — Mensagens de erro internas devolvidas ao cliente

**Ficheiro:** [http-exception.ts:52-64](src/Common/Filters/http-exception.ts#L52-L64)

```ts
} else if (exception instanceof Error) {
  try {
    const parsed = JSON.parse(exception.message);
    ...
  } catch {
    responseBody = { message: exception.message };   // ← mensagem interna exposta
  }
}
```

Qualquer `Error` não tratado — incluindo erros do Prisma, que citam nomes de modelos, campos e argumentos — é devolvido em texto ao cliente com estado 500. Os serviços apanham a maioria destes casos, mas erros lançados fora dos blocos `try` (guards, interceptors, middleware) chegam aqui directamente.

**Correcção:** em produção, registar o erro completo no logger e devolver sempre `"Ocorreu um erro interno no servidor"`.

---

### 🔵 V-13 — Códigos OTP de 4 dígitos por omissão

**Ficheiro:** [generate-otp-code.protocol.ts:5](src/Common/Utils/AuthenticationsProcols/2FA/generate-otp-code.protocol.ts#L5)

`async generate(digits: number = 4, ...)` — 10.000 combinações. O limite de 5 tentativas ajuda, mas é contornável pedindo um código novo (não há limite de pedidos — V-08). O padrão da indústria é 6 dígitos.

---

### 🔵 V-14 — Ficheiros de utilizadores versionados no Git

`uploads/AcademyLogos/` e `uploads/AthletePhotos/` estão sob controlo de versões — **fotografias de atletas reais**, incluindo potencialmente menores, no histórico do repositório. O `.gitignore` não cobre `uploads/`.

**Correcção:** acrescentar `uploads/` ao `.gitignore`, remover do índice (`git rm -r --cached uploads`) e, se o repositório for partilhado, expurgar o histórico (`git filter-repo`). Ficheiros de utilizador pertencem a armazenamento de objectos, não ao repositório.

---

## 4. Bugs Funcionais

Achados que impedem o funcionamento correcto, independentemente de segurança.

### 🔴 B-01 — Erro de compilação: `DocumentType` não importado

**Ficheiro:** [edit-athelete-datas.service.ts:63](src/Modules/Users/Atheles/Services/edit-athelete-datas.service.ts#L63)

```ts
if (!Object.values(DocumentType).includes(datas.documentType)) {
```

O ficheiro importa apenas `BeltColor` de `generated/prisma/enums` — `DocumentType` não é importado nem declarado. Isto é um `TS2304: Cannot find name 'DocumentType'`, pelo que **`nest build` deve falhar** e o projecto não compila no estado actual.

**Correcção:** `import { BeltColor, DocumentType } from "generated/prisma/enums";`

> ⚠️ Confirmar com `pnpm install && pnpm run build` — não foi possível executar o compilador neste ambiente.

---

### 🔴 B-02 — Reposição de senha rebenta ao gravar

**Ficheiro:** [PrismaAccountsRepositories.ts:42-47](src/Modules/Accounts/Repositories/Prisma/PrismaAccountsRepositories.ts#L42-L47)

```ts
async editAccountDatas(id_account: string, datas: Partial<AccountDto>) {
  return await this.prisma.account.update({ where: { id: id_account }, data: {
    ...datas,                      // espalha { password: "..." }
    passwordHash: datas.password
  }})
}
```

`ResetPasswordService` chama `editAccountDatas(id, { password: hash })`. O spread injecta a chave `password` no objecto `data` do Prisma — campo que **não existe** no modelo `Account`. O Prisma lança `Unknown argument 'password'`, o serviço apanha o erro e devolve 500.

**Resultado: nenhum utilizador consegue repor a senha.** O mesmo vale para `phone_number` (o campo no schema chama-se `phone`).

**Correcção:**
```ts
async editAccountDatas(id_account: string, datas: { password?: string; email?: string; phone?: string }) {
  return this.prisma.account.update({ where: { id: id_account }, data: {
    ...(datas.email && { email: datas.email }),
    ...(datas.phone && { phone: datas.phone }),
    ...(datas.password && { passwordHash: datas.password }),
  }});
}
```

---

### 🔴 B-03 — Contas sem academia não conseguem entrar

**Ficheiro:** [signin.service.ts:44](src/Modules/Auth/Services/signin.service.ts#L44)

```ts
let subscription = account.academy.subscription ?? null   // ← sem guarda de nulidade
console.log(subscription)
if (account.academy && !subscription && account.academy.type != "CENTRAL") {   // ← verificação chega tarde
```

A linha 44 desreferencia `account.academy` antes de a linha 46 confirmar que existe. Para qualquer conta ligada a um `User` e não a uma `Academy` — ou seja, `ADMIN_DEV`, `MASTER`, `INSTRUCTOR`, `ATHLETE` — lança `TypeError`, apanhado pelo `catch` genérico e convertido em **500**.

O ramo `else if (account.user)` das linhas 57-59, que existe precisamente para tratar estes casos, é **inalcançável**.

**Correcção:** mover a leitura da subscrição para dentro da verificação:
```ts
let subscription = account.academy?.subscription ?? null;
```

---

### 🟠 B-04 — Actualizar a graduação de um atleta é impossível

**Ficheiro:** [edit-athelete-datas.service.ts:69-76](src/Modules/Users/Atheles/Services/edit-athelete-datas.service.ts#L69-L76)

```ts
if (datas.currentDegree) {
  if (!Object.values(DocumentType).includes(datas.currentDegree)) {   // ← enum errado
    throw new BadRequestException("Número de divisas inválido.");
  }
```

Valida o **grau de faixa** (`NONE`, `FIRST`, `SECOND`...) contra o enum de **tipo de documento** (`BI`, `PASSPORT`). A condição é sempre verdadeira, logo qualquer tentativa de actualizar `currentDegree` é rejeitada. Deve ser `Object.values(BeltDegree)`.

---

### 🟠 B-05 — Fluxo de OTP por telemóvel referencia campos inexistentes

**Ficheiro:** [PrismaAuthenticationRepositories.ts:82,101](src/Modules/Auth/Repositories/Prisma/PrismaAuthenticationRepositories.ts#L82)

```ts
params.phone_number ? { phone_number: params.phone_number } : undefined,      // linha 82
params.phone_number ? { temp_phone_number: params.phone_number } : undefined, // linha 101
```

No schema, o campo chama-se `temp_phone` ([schema.prisma:107](prisma/schema.prisma#L107)). Nenhum dos dois nomes usados existe. Sempre que um pedido de OTP passe `phone_number`, o Prisma rejeita a consulta e o fluxo termina em 500. **A autenticação por telemóvel nunca funcionou.**

---

### 🟠 B-06 — Validação de chave de download não é atómica

**Ficheiro:** [validate-download-keys.service.ts:32-53](src/Modules/Download-Keys/Service/validate-download-keys.service.ts#L32-L53)

O comentário declara a intenção — o código não a cumpre:

```ts
/**
 * 🔥 UPDATE ATÓMICO (ESSENCIAL)
 * Isso deve garantir que apenas 1 request consegue usar a chave
 */
const updated = await this.repository.updateDownloadKey(downloadKey.id, { status: "USED", ... });
```

É um *read-then-write* sem condição na cláusula `WHERE`. Dois pedidos concorrentes passam ambos na verificação `status === "USED"` (linha 32) antes de qualquer escrita, e ambos recebem "Download liberado!". A chave de activação — que é o mecanismo de licenciamento da app desktop — pode ser usada N vezes com um simples pedido paralelo.

**Correcção:**
```ts
const { count } = await this.prisma.downloadKey.updateMany({
  where: { id: downloadKey.id, status: 'ACTIVE', expiresAt: { gt: new Date() } },
  data:  { status: 'USED', usedAt: new Date(), usedByIp: ip },
});
if (count === 0) throw new ForbiddenException('Esta chave já foi utilizada.');
```

---

### 🟠 B-07 — Códigos de afiliação com apenas 9.000 valores possíveis

**Ficheiro:** [generate-codes.ts:17-20](src/Common/Utils/generate-codes.ts#L17-L20)

```ts
function generateAffiliateNumber(): string {
  const random = Math.floor(1000 + Math.random() * 9000);   // Math.random — não criptográfico
  return `ATA-${String(random).padStart(4, '0')}`;
}
```

Três problemas: (1) `Math.random()` é previsível, ao contrário do `randomBytes` usado — correctamente — na função vizinha; (2) o espaço é de 9.000 valores, partilhado por **todos os atletas da plataforma**; (3) os chamadores fazem `while (true)` até encontrar um código livre:

```ts
// register-athletes.service.ts:50
while (true) {
  affiliateCode = generateAffiliateNumber();
  const conflict = await this.prisma.athlete.findFirst({ where: { affiliateCode } });
  if (!conflict) break;
}
```

À medida que a rede cresce, o ciclo faz cada vez mais idas à base de dados; ao atingir 9.000 atletas torna-se um **ciclo infinito** que bloqueia o event loop. Note-se ainda que o schema define `affiliateCode ... @default(cuid())` — o valor por omissão, seguro, é sobreposto por esta função.

**Correcção:** usar `randomBytes` com um espaço muito maior (ex.: `ATA-` + 8 caracteres do `CHARSET` já definido), confiar na restrição `@unique` da BD e reagir ao erro P2002 em vez de sondar em ciclo.

---

### 🟡 B-08 — Graduação errada é aprovada

**Ficheiro:** [set-graduation-status.service.ts:47-57](src/Modules/Graduations/Services/set-graduation-status.service.ts#L47-L57)

```ts
const pendingGraduation = existsAthlete.graduations.find(g => g.status === 'PENDING');
if (!pendingGraduation) throw new NotFoundException(...);
...
const result = await this.repository.setGraduationStatus(existsAthlete.graduations[0].id, ...)   // ← índice 0
```

Encontra a graduação pendente correcta e depois actua sobre `graduations[0]`. Para um atleta com histórico (o caso normal após a primeira graduação), aprova ou reprova **a graduação errada**. A verificação da linha 53 sofre do mesmo problema.

**Correcção:** usar `pendingGraduation.id` e `pendingGraduation.status`.

---

### 🟡 B-09 — Tipo de academia ignorado no registo

**Ficheiro:** [register-academy.service.ts:80](src/Modules/Academies/Services/register-academy.service.ts#L80)

```ts
const academy = await this.repositoy.createAcademy({
  type: "AFFILIATE",   // ← fixo, ignora datas.type
```

Mas a linha 65 usa `datas.type === "AFFILIATE"` para decidir se gera o `affiliateNumber`. Registar com `type: "CENTRAL"` produz uma academia `AFFILIATE` **sem número de afiliação** — um estado inconsistente. A linha 113 (`transaction.type === 'CENTRAL'`) é código morto.

*Nota:* fixar o tipo é a decisão de segurança certa (impede que alguém se auto-registe como CENTRAL). O que falta é **rejeitar** explicitamente `type: CENTRAL` no DTO, em vez de o ignorar em silêncio.

---

### 🟡 B-10 — Verificações de unicidade não excluem o próprio registo

**Ficheiros:** [edit-academy-datas.service.ts:44,61,70](src/Modules/Academies/Services/edit-academy-datas.service.ts#L44) · [edit-athelete-datas.service.ts:54](src/Modules/Users/Atheles/Services/edit-athelete-datas.service.ts#L54)

```ts
const alreadyExistsName = await this.prisma.academy.findFirst({ where: { name: datas.name } })
if (alreadyExistsName) throw new ConflictException("Este nome já está sendo usado")
```

Submeter o formulário de edição sem alterar o nome encontra o próprio registo e devolve 409. Aplica-se a `name`, `email`, `phone` (academias) e `documentNumber` (atletas).

**Correcção:** `where: { name: datas.name, id: { not: id } }`

---

### 🟡 B-11 — Transferência de atletas entre academias sem autorização

**Ficheiro:** [edit-athelete-datas.service.ts:86-94](src/Modules/Users/Atheles/Services/edit-athelete-datas.service.ts#L86-L94)

Depois de passar a verificação de posse, o serviço aceita um `academyId` novo vindo do corpo do pedido e apenas confirma que a academia de destino existe:

```ts
if (datas.academyId) {
  const existsAcademy = await this.prisma.academy.findFirst({ where: { id: datas.academyId } })
  if (!existsAcademy) throw new NotFoundException(...)
  datasToUpdate.academyId = datas.academyId   // ← move o atleta para outra academia
}
```

Uma afiliada pode empurrar os seus atletas para o cadastro de outra academia — corrompendo dados alheios e escapando às suas próprias métricas. Transferências desta natureza devem exigir aprovação da CENTRAL.

---

### 🟡 B-12 — `subscriptionStatus` perde-se ao renovar o token

**Ficheiro:** [refreshToken.service.ts:58-61](src/Modules/Auth/Services/refreshToken.service.ts#L58-L61)

```ts
const newAccessToken = await JwtOperations.GenerateToken(
  { sub: decodedToken.sub, role: decodedToken.role },   // subscriptionStatus não é propagado
  "access",
);
```

O login inclui `subscriptionStatus` no payload; o refresh omite-o. Qualquer lógica de cliente ou servidor que dependa desta claim comporta-se de forma diferente antes e depois do primeiro refresh — 15 minutos após o login.

Falta também **rotação do refresh token** e detecção de reutilização: o mesmo refresh serve durante 7 dias, e um token roubado não deixa rasto nem é invalidado.

---

### 🔵 B-13 — Emails enviados de si próprios

**Ficheiro:** [email-sender.ts:26-34](src/Modules/Emails/email-sender.ts#L26-L34)

```ts
to:   { name: message.to.name, address: message.to.email },
from: { name: message.to.name, address: message.to.email },   // ← from = to
```

O remetente é o próprio destinatário. Falha em SPF/DKIM/DMARC e a maioria dos servidores marca como spam ou rejeita. Os emails de recuperação de senha provavelmente não chegam. Deve usar um remetente fixo configurado (`process.env.SMTP_FROM`).

---

### 🔵 B-14 — Limites de tamanho por tipo de upload não são aplicados

**Ficheiro:** [multer-config.ts:94-96](src/Common/Utils/multer-config.ts#L94-L96)

```ts
limits: { fileSize: Math.max(...Object.values(maxFileSizes)) }   // = 10 MB para tudo
```

A tabela `maxFileSizes` define limites por tipo (2 MB para logótipos, 5 MB para fotografias), mas o `Math.max` aplica o maior valor — 10 MB — a todos os campos. Os limites individuais são decorativos.

---

### 🔵 B-15 — `getOrSet` não cacheia valores falsy

**Ficheiro:** [cache.service.ts:53-55](src/Modules/Cache/cache.service.ts#L53-L55)

```ts
const cached = this.get<T>(key);
if (cached) { return { data: cached, cached: true }; }
```

`0`, `""`, `false` e `null` são tratados como ausência de cache, pelo que a `factory` corre em todos os pedidos. Deve usar `this.cache.has(key)`.

---

### 🔵 B-16 — Valor da subscrição pode ser `NaN`

**Ficheiro:** [register-payment.service.ts:58-63](src/Modules/Subscriptions/Services/register-payment.service.ts#L58-L63)

```ts
amount: Number(process.env.SUBSCRIPTION_AMOUNT_AOA),   // undefined → NaN
currency: process.env.SUBSCRIPTION_CURRENCY!,          // undefined → erro Prisma
```

Sem a variável de ambiente definida, `Number(undefined)` é `NaN` e o Prisma rejeita a escrita do `Decimal`. Sintoma directo da ausência de validação de configuração (§5.3).

---

## 5. Pontos Negativos — Arquitectura e Qualidade

### 5.1 Zero testes

`jest` está configurado no `package.json` (incluindo `test:cov`, `test:ci`, `test:e2e:ci`) e existe uma pasta `test/` com `jest-e2e.json` e ficheiros de setup. **Não existe um único ficheiro `.spec.ts` no projecto.** O ficheiro `test/Academies/teste.ts` nem sequer segue o padrão que o `testRegex` reconhece.

Para um sistema multi-tenant que gere dinheiro e dados de menores, esta é a lacuna estrutural mais séria depois das falhas de isolamento — e é a razão pela qual bugs como B-02 (reposição de senha completamente partida) e B-03 (login impossível para utilizadores) podem existir sem serem notados.

**Cobertura mínima antes de produção:**

```
src/Modules/Auth/Services/*.spec.ts             — login, refresh, reset, OTP
src/Modules/**/Services/*-tenant.spec.ts        — 1 teste por endpoint: academia A não acede a B
test/e2e/subscriptions.e2e-spec.ts              — fluxo de pagamento ponta a ponta
```

O padrão repositório já implementado torna estes testes fáceis de escrever: basta injectar um duplo em vez do `Prisma*Repositories`.

### 5.2 Dependências instaladas e nunca usadas

| Pacote | Estado | Consequência |
|---|---|---|
| `helmet` | Instalado, nunca importado | Sem cabeçalhos de segurança HTTP (V-08) |
| `express-rate-limit` | Instalado, nunca importado | Sem limite de tentativas (V-08) |
| `compression` | Instalado, nunca importado | Respostas grandes sem compressão gzip |
| `@nestjs/config` | Instalado, `ConfigModule` nunca registado | Sem validação de ambiente (§5.3) |
| `cloudinary` | Configuração existe, nunca usada | Uploads ficam em disco local (§5.7) |
| `@nestjs/passport`, `passport` | Instalados, nunca usados | Peso morto — o auth é manual |

Corrigir isto são cerca de 6 linhas em `main.ts` e resolve boa parte de V-08.

### 5.3 Sem validação de configuração

O código lê 25 variáveis de ambiente distintas com `process.env.X` espalhado por serviços, repositórios e seeds. Não há `.env.example`, nem schema de validação, nem `ConfigService`.

Consequências já visíveis: B-16 (`NaN` no valor da subscrição), a dependência frágil de `NODE_ENV` em V-09(c), e a impossibilidade de saber que variáveis são necessárias sem percorrer o código.

**Correcção:** registar `ConfigModule.forRoot({ isGlobal: true, validationSchema })` em [app.module.ts](src/app.module.ts) e substituir os acessos directos por `configService.get()`. A aplicação deve **recusar arrancar** se faltar `JWT_SECRET`, `DATABASE_URL` ou `SUBSCRIPTION_AMOUNT_AOA`.

### 5.4 Logging via `console.log`

62 chamadas a `console.log`/`console.error`/`console.warn` em código de produção. Vários registam o objecto de erro completo (`console.log(error)`), o que em contexto Prisma inclui parâmetros de consulta — potencialmente senhas e dados pessoais nos logs. Há ainda um `console.log(datas)` em [PrismaAccountsRepositories.ts:15](src/Modules/Accounts/Repositories/Prisma/PrismaAccountsRepositories.ts#L15) que **imprime a senha em claro** no momento do registo de conta.

Sem níveis, sem contexto de pedido, sem correlação, sem redacção. O `Logger` do NestJS já é usado nos cron jobs — basta estendê-lo ao resto.

### 5.5 Modelo `AuditLog` definido e nunca escrito

O schema define uma tabela `AuditLog` completa e bem pensada (`action`, `entity`, `entityId`, `before`, `after`, `ipAddress`, indexada por `academyId, createdAt`). **Nenhuma linha de código escreve nela.**

Numa plataforma multi-tenant com operações financeiras, isto significa que não é possível responder a "quem cancelou esta subscrição?" ou "quem apagou este atleta?". Dado o V-03, é também a razão pela qual uma fraude de subscrição não deixaria qualquer rasto.

**Correcção:** um interceptor global que registe todas as mutações (`POST`/`PATCH`/`PUT`/`DELETE`) com o `sub` do token e o IP.

### 5.6 Cache em memória impede escalar horizontalmente

[CacheService](src/Modules/Cache/cache.service.ts) usa `NodeCache` — memória do processo. Com mais do que uma instância:

- Cada instância tem uma vista diferente dos dados
- `invalidatePattern()` só limpa a instância que recebeu a escrita — as outras continuam a servir dados obsoletos até ao TTL
- Reiniciar perde tudo
- Combinado com V-01 (sem tecto no `limit`), o cache é um vector de esgotamento de memória

Adicionalmente, `useClones: false` devolve referências partilhadas: quem alterar um objecto lido do cache corrompe a entrada para todos os leitores seguintes.

**Correcção:** Redis via `cache-manager-ioredis`. A API do `CacheService` já está bem desenhada — só muda o backend.

### 5.7 Armazenamento de ficheiros em disco local

`multer.diskStorage` grava em `process.cwd()/uploads`. Isto impede escalar horizontalmente (cada instância vê apenas os seus ficheiros), perde dados em deploys com sistema de ficheiros efémero (contentores, Heroku, Railway) e serve os ficheiros da mesma origem da API (V-06).

`cloudinary` já está instalado e [cloudinary-config.ts](src/Common/Utils/cloudinary-config.ts) já existe — falta ligá-lo.

### 5.8 TypeScript com verificações relaxadas

```jsonc
"noImplicitAny": false,        // any implícito permitido
"strictBindCallApply": false,
// "strict" ausente
```

Combinado com `Promise<any>` como tipo de retorno de **praticamente todos os métodos de repositório**, o sistema de tipos não oferece protecção nas fronteiras onde ela mais importa. Bugs como B-01, B-02 e B-05 são exactamente os que um `strict: true` com repositórios tipados apanharia em tempo de compilação.

O ESLint está configurado com `recommendedTypeChecked` (bom), mas `no-explicit-any` está desligado.

### 5.9 Modelo de autorização contraditório

Existem dois mecanismos que não concordam entre si:

- `@Roles(...)` — verifica o papel
- `credentials.sub !== recurso.academyId` — verifica a posse

O resultado é que `@Roles(Role.CENTRAL)` aparece em endpoints que a CENTRAL **não consegue executar**, porque a verificação de posse a bloqueia (o `sub` da CENTRAL é o ID da sua própria academia). O papel `ADMIN_DEV` aparece em `@Roles` mas nunca é emitido no login para contas de academia. `Role.MASTER`, `Role.INSTRUCTOR` e `Role.ATHLETE` existem no schema mas não no [enum de papéis](src/Modules/Auth/Guards/roles.enum.ts) da aplicação.

**Correcção:** centralizar as decisões numa camada única (um `PoliciesGuard` ou uma função `can(credentials, action, resource)`) em vez de repetir `if (credentials?.sub !== ...)` em 23 sítios.

### 5.10 Sem paginação máxima nem protecção contra sobrecarga

Todos os endpoints de listagem aceitam `limit` sem tecto. `GET /academies` (público), `GET /athletes`, `GET /athlete-payments`. Um `?limit=1000000` é sempre aceite.

### 5.11 Erros de nomenclatura generalizados

`Atheles` (Athletes), `AutehticationsDto` (Authentications), `gradtuations.module`, `reflactor` (reflector), `cahched` (cached), `IAthlete-repositories` duplicado em dois módulos com significados diferentes, `datas` como plural de `data`, `Ocrreu`, `enonctrada`. Além disso, há dois ficheiros `IAthlete-repositories.ts` em módulos diferentes com interfaces distintas — fonte garantida de confusão em imports.

Não afecta a execução, mas aumenta a fricção de manutenção e o risco de importar o símbolo errado.

### 5.12 Custo de bcrypt inconsistente

Custo 12 no registo de conta e na reposição de senha; custo 10 nas seeds, na mudança de senha via academia e no hash de OTP. Deve ser uma constante única e configurável.

### 5.13 Detalhes operacionais em falta

- Sem `app.enableShutdownHooks()` — ligações Prisma não fecham em SIGTERM
- Endpoint `/health` existe mas não verifica conectividade à BD
- Sem `Dockerfile` nem definição de CI (`test:ci` está definido mas nada o executa)
- Apenas 2 migrações, uma chamada `teste` — indica que o schema ainda não estabilizou
- `PrismaService` é registado como provider em cada módulo em vez de um módulo global partilhado — múltiplas instâncias, múltiplos pools de ligações
- `@PublicRoute()` em `POST /auth/logout` — qualquer pessoa que conheça um refresh token pode terminar a sessão correspondente

---

## 6. Plano de Correcção Priorizado

### Fase 0 — Bloqueadores absolutos (antes de qualquer deploy)

| # | Acção | Ref. | Esforço |
|---|---|---|---|
| 1 | Remover `@PublicRoute()` de `GET /academies` e reduzir a projecção de dados | V-01 | 1 h |
| 2 | Impor tecto de `limit` em todas as listagens | V-01, 5.10 | 1 h |
| 3 | Derivar `academyId` do token em todos os endpoints de atletas | V-02 | 3 h |
| 4 | Restringir subscrições a `CENTRAL`/`ADMIN_DEV` e adicionar verificação de posse | V-03 | 4 h |
| 5 | Corrigir import de `DocumentType` (o build está partido) | B-01 | 5 min |
| 6 | Corrigir `editAccountDatas` (reposição de senha) | B-02 | 15 min |
| 7 | Corrigir desreferência de `account.academy` no login | B-03 | 5 min |
| 8 | Adicionar claim `typ` aos JWT e validá-la no guard | V-04 | 2 h |
| 9 | Activar `helmet`, `compression` e `express-rate-limit` | V-08 | 30 min |
| 10 | Remover `rejectUnauthorized: false` do SMTP | V-07 | 5 min |
| 11 | Remover o vazamento de token condicionado por `NODE_ENV` | V-09c | 5 min |
| 12 | Lista branca de extensões nos uploads; remover SVG | V-06 | 1 h |
| 13 | `uploads/` para o `.gitignore` e fora do índice Git | V-14 | 15 min |

**Estimativa: 2 a 3 dias de trabalho.**

### Fase 1 — Consolidação (1 a 2 semanas)

| # | Acção | Ref. |
|---|---|---|
| 14 | Padronizar o payload JWT (`sub`/`academyId`/`role`/`typ`) e actualizar as 23 verificações | V-05, 5.9 |
| 15 | Guardar tokens de reposição hasheados e invalidar sessões após mudança de senha | V-09b, V-09d |
| 16 | Resposta uniforme em `password/request` (anti-enumeração) | V-09a |
| 17 | Tornar atómica a validação de chaves de download | B-06 | 
| 18 | Substituir `generateAffiliateNumber` por geração criptográfica com espaço amplo | B-07 |
| 19 | Corrigir nomes de campos no fluxo de OTP por telemóvel | B-05 |
| 20 | Corrigir `graduations[0]` → `pendingGraduation` | B-08 |
| 21 | Excluir o próprio registo nas verificações de unicidade | B-10 |
| 22 | Bloquear alteração de `academyId` na edição de atletas | B-11 |
| 23 | CORS com lista branca; Swagger fora de produção | V-10, V-11 |
| 24 | `ConfigModule` com validação de schema e `.env.example` | 5.3 |
| 25 | Substituir `console.*` pelo `Logger`; remover o log de senha em claro | 5.4 |
| 26 | Escrever testes de isolamento multi-tenant (um por endpoint) | 5.1 |

### Fase 2 — Robustez (1 mês)

| # | Acção | Ref. |
|---|---|---|
| 27 | Interceptor de auditoria a escrever em `AuditLog` | 5.5 |
| 28 | Migrar cache para Redis | 5.6 |
| 29 | Migrar uploads para Cloudinary | 5.7 |
| 30 | Activar `strict: true` e tipar os retornos dos repositórios | 5.8 |
| 31 | Rotação de refresh tokens com detecção de reutilização | B-12 |
| 32 | OTP para 6 dígitos | V-13 |
| 33 | Cobertura de testes ≥ 60% nos módulos Auth e Subscriptions | 5.1 |
| 34 | Pipeline CI a correr `lint:check` + `test:ci` | 5.13 |
| 35 | Dockerfile, health check com verificação de BD, shutdown hooks | 5.13 |

---

## 7. Melhorias Recomendadas a Médio Prazo

**Segurança**
- Middleware de tenant que injecte `academyId` no contexto do pedido, tornando o isolamento estrutural em vez de manual
- Row-Level Security no PostgreSQL como segunda linha de defesa
- Idempotency keys nas operações financeiras
- Bloqueio progressivo de conta após N logins falhados

**Arquitectura**
- `PrismaModule` global (`@Global()`) em vez de registar `PrismaService` em cada módulo
- Um `SharedModule` para `CacheService`, `PrismaService` e `Logger`
- DTOs de resposta explícitos (`class-transformer` + `@Exclude`) — hoje as entidades Prisma são devolvidas cruas, o que é a causa-raiz de V-01
- Padronizar o envelope de resposta num interceptor, em vez de o repetir manualmente em cada serviço

**Domínio**
- O modelo `Championship` existe no schema mas não tem módulo, controlador ou serviço — funcionalidade incompleta
- Não há gestão de utilizadores (`User`): os papéis `MASTER`, `INSTRUCTOR` e `ATHLETE` estão no schema mas não há forma de os criar
- A regra de negócio de elegibilidade para graduação (percentagem de presenças) não está implementada — `totalClasses` e `attendedClasses` são passados de fora

**Operação**
- Sentry ou equivalente para rastreio de erros
- Métricas Prometheus (`@willsoto/nestjs-prometheus`)
- Backups automáticos com teste de restauro
- `pnpm audit` no CI

---

## 8. Anexo — Matriz de Endpoints e Isolamento

Legenda: ✅ verifica posse · ❌ não verifica · ⚪ não aplicável · 🔓 público

| Método | Rota | Papéis | Isolamento | Risco |
|---|---|---|---|---|
| POST | `/auth/signin` | 🔓 | ⚪ | 🟠 Sem rate limit |
| POST | `/auth/refreshToken` | 🔓 | ⚪ | 🟡 Sem rotação |
| POST | `/auth/logout` | 🔓 | ❌ | 🔵 Revoga sessão alheia se conhecer o token |
| GET | `/auth/me` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN, ADMIN_DEV | ✅ | — |
| POST | `/auth/password/request` | 🔓 | ⚪ | 🟠 Enumeração + fuga de token |
| POST | `/auth/password/reset` | 🔓 | ⚪ | 🔴 **Partido** (B-02) |
| POST | `/auth/otp/send` | 🔓 | ⚪ | 🟠 Sem rate limit |
| POST | `/auth/otp/verify` | 🔓 | ⚪ | 🟠 Força bruta de 4 dígitos |
| GET | `/academies` | 🔓 | ❌ | 🔴 **Fuga massiva de PII** |
| POST | `/academies` | 🔓 | ⚪ | 🟠 Registo massivo |
| GET | `/academies/:id` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ✅ | 🟡 CENTRAL bloqueada |
| PATCH | `/academies/:id` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ✅ | 🟡 CENTRAL bloqueada |
| DELETE | `/academies/:id` | ADMIN_DEV, CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ✅ | — |
| PATCH | `/academies/:id/status` | CENTRAL | ⚪ | — |
| GET | `/reports/academies` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ✅ | — |
| GET | `/athletes` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ❌ | 🔴 **`academyId` da query** |
| GET | `/athletes/:id` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ❌ | 🔴 **IDOR** |
| GET | `/athletes/:code/affiliate-code` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ❌ | 🔴 **IDOR + enumerável** |
| POST | `/athletes` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ✅ | — |
| PATCH | `/athletes/:id` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ✅ | 🟡 Permite transferência (B-11) |
| DELETE | `/athletes/:id` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ✅ | — |
| POST | `/athlete-payments` | CENTRAL, AFFILIATE | ✅ | — |
| GET | `/athlete-payments` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ✅ | — |
| GET | `/athlete-payments/:athleteId` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ✅ | — |
| PATCH | `/athletes/payments/:id/status` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ✅ | — |
| POST | `/attendance` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ✅ | — |
| GET | `/attendance/resume` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ✅ | — |
| POST | `/graduations` | CENTRAL, AFFILIATE | ✅ | — |
| GET | `/graduations` | CENTRAL, AFFILIATE | ✅ | — |
| PUT | `/graduations/:athleteId/status` | CENTRAL, AFFILIATE | ✅ | 🟡 Graduação errada (B-08) |
| POST | `/graduations/reviews` | CENTRAL, AFFILIATE | ✅ | — |
| POST | `/subscriptions/payments` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ❌ | 🔴 **Fraude de pagamento** |
| POST | `/subscriptions/:academyId` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ❌ | 🔴 **Cross-tenant** |
| PATCH | `/subscriptions/payments/:id/confirm` | ADMIN_DEV | ❌ | 🟠 Sem posse |
| PATCH | `/subscriptions/:id/cancel` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN, ADMIN_DEV | ❌ | 🔴 **Sabotagem** |
| PATCH | `/subscriptions/:id/renew` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN, ADMIN_DEV | ❌ | 🔴 **Renovação grátis** |
| GET | `/subscriptions/:id/payments` | ADMIN_DEV | ❌ | 🟡 Sem posse |
| GET | `/subscriptions/payments/overdue` | ADMIN_DEV | ⚪ | — |
| POST | `/download-keys` | CENTRAL | ⚪ | — |
| POST | `/download-keys/validate` | CENTRAL, AFFILIATE, AFFILIATE_ADMIN | ❌ | 🟠 Race condition (B-06) |
| GET | `/download-keys/:key` | CENTRAL | ⚪ | — |
| DELETE | `/download-keys/:key` | CENTRAL | ⚪ | — |
| GET | `/health` | 🔓 | ⚪ | 🔵 Não verifica a BD |

**Resumo:** de 43 endpoints, **11 manipulam dados de outros tenants sem qualquer verificação de posse**.

---

## Conclusão

O ATA-Ryu está bem estruturado e o autor claramente entende os padrões que quer aplicar — o padrão repositório, a separação por caso de uso, o modelo de dados e as verificações de tenant que *existem* estão correctos e bem escritos. Esta não é uma base que precise de ser reescrita.

O que falha é a **consistência**: o mesmo cuidado que produziu a verificação de posse em `mark-attendance.service.ts` não chegou a `get-atheletes-datas-by-id.service.ts`, e o resultado é um sistema onde metade das portas está trancada e a outra metade está aberta. Somando as vulnerabilidades de isolamento (V-01 a V-03) e os bugs que partem fluxos centrais (B-01 a B-03), **o sistema não deve ser exposto publicamente no estado actual**.

A boa notícia é que a Fase 0 — que fecha todas as falhas críticas — são cerca de **2 a 3 dias de trabalho**, porque a arquitectura já tem os pontos de extensão certos nos sítios certos. A prioridade a seguir deve ser a **suite de testes de isolamento**: é o que impede que estas falhas voltem a aparecer à medida que o projecto cresce.

---

*Auditoria realizada por análise estática. Recomenda-se, após as correcções da Fase 0, um teste de intrusão dinâmico com a aplicação em execução, e a confirmação dos achados de compilação (B-01) com `pnpm install && pnpm run build`.*
