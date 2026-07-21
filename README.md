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
8. [Modelo de Subscrição (actual)](#modelo-de-subscrição-actual)
9. [**Modelo de Monetização — Análise para o Mercado Angolano**](#modelo-de-monetização--análise-para-o-mercado-angolano)
10. [**Custos Operacionais até à Produção**](#custos-operacionais-até-à-produção)
11. [**Estimativa de Valor do Projecto**](#estimativa-de-valor-do-projecto)
12. [Segurança e Multi-tenancy](#segurança-e-multi-tenancy)
13. [Começar a Usar](#começar-a-usar)
14. [Variáveis de Ambiente](#variáveis-de-ambiente)
15. [Áreas Sugeridas para Auditoria](#áreas-sugeridas-para-auditoria)
16. [Licença](#licença)

---

## Visão Geral

O **ATA-Ryu** é uma plataforma SaaS que permite a uma academia central de BJJ gerir toda a sua rede de afiliadas a partir de um único lugar. Cada afiliada opera num ambiente completamente isolado, enquanto a sede mantém visibilidade e controlo global sobre atletas, graduações, pagamentos e subscrições em toda a rede.

O nome *Ryu* (流) vem do japonês e significa **linhagem** ou **escola** — uma referência directa à estrutura hierárquica das academias de BJJ e à sua relação com a escola fundadora.

A plataforma é composta por três aplicações num monorepo: uma **API** (NestJS + PostgreSQL), uma **app desktop** (Electron + React, offline-first) usada no dia a dia pelas academias, e um **site de distribuição** (Next.js) onde as afiliadas validam a chave de activação física para descarregar a app.

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

### 🔐 Segurança e Multi-tenancy (resumo)
- Todos os queries são obrigatoriamente filtrados por `academyId` — a Academia A nunca acede a dados da Academia B
- Autenticação JWT com refresh tokens e 2FA opcional via OTP
- Estado da subscrição da academia verificado ao nível do guard em cada request
- Log de auditoria completo de todas as acções críticas

*(secção detalhada mais abaixo)*

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Backend | Node.js · TypeScript · NestJS |
| Base de Dados | PostgreSQL · Prisma ORM |
| App Desktop | Electron · React · TypeScript · shadcn/ui · SQLite local (offline-first) |
| Site de Download/Landing | Next.js/React · Tailwind CSS |
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
│   │   │   │   │   └── academy-status.guard.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   └── utils/
│   │   │   │       ├── affiliate-code.util.ts
│   │   │   │       ├── download-key.util.ts
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
│   │   │       ├── academies/
│   │   │       │   ├── academies.module.ts
│   │   │       │   ├── academies.controller.ts
│   │   │       │   ├── academies.service.ts
│   │   │       │   ├── academies.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-academy.dto.ts
│   │   │       │       ├── update-academy.dto.ts
│   │   │       │       └── approve-academy.dto.ts
│   │   │       ├── users/
│   │   │       │   ├── users.module.ts
│   │   │       │   ├── users.controller.ts
│   │   │       │   ├── users.service.ts
│   │   │       │   ├── users.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-user.dto.ts
│   │   │       │       └── update-user.dto.ts
│   │   │       ├── athletes/
│   │   │       │   ├── athletes.module.ts
│   │   │       │   ├── athletes.controller.ts
│   │   │       │   ├── athletes.service.ts
│   │   │       │   ├── athletes.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-athlete.dto.ts
│   │   │       │       └── update-athlete.dto.ts
│   │   │       ├── payments/
│   │   │       │   ├── payments.module.ts
│   │   │       │   ├── payments.controller.ts
│   │   │       │   ├── payments.service.ts
│   │   │       │   ├── payments.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-payment.dto.ts
│   │   │       │       └── update-payment.dto.ts
│   │   │       ├── subscriptions/
│   │   │       │   ├── subscriptions.module.ts
│   │   │       │   ├── subscriptions.controller.ts
│   │   │       │   ├── subscriptions.service.ts
│   │   │       │   ├── subscriptions.repository.ts
│   │   │       │   └── dto/
│   │   │       │       └── update-subscription.dto.ts
│   │   │       ├── attendance/
│   │   │       │   ├── attendance.module.ts
│   │   │       │   ├── attendance.controller.ts
│   │   │       │   ├── attendance.service.ts
│   │   │       │   ├── attendance.repository.ts
│   │   │       │   └── dto/
│   │   │       │       └── mark-attendance.dto.ts
│   │   │       ├── graduations/
│   │   │       │   ├── graduations.module.ts
│   │   │       │   ├── graduations.controller.ts
│   │   │       │   ├── graduations.service.ts
│   │   │       │   ├── graduations.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-graduation-event.dto.ts
│   │   │       │       ├── create-graduation.dto.ts
│   │   │       │       └── create-review.dto.ts
│   │   │       ├── championships/
│   │   │       │   ├── championships.module.ts
│   │   │       │   ├── championships.controller.ts
│   │   │       │   ├── championships.service.ts
│   │   │       │   ├── championships.repository.ts
│   │   │       │   └── dto/
│   │   │       │       ├── create-championship.dto.ts
│   │   │       │       └── register-athlete.dto.ts
│   │   │       ├── download-keys/
│   │   │       │   ├── download-keys.module.ts
│   │   │       │   ├── download-keys.controller.ts
│   │   │       │   ├── download-keys.service.ts
│   │   │       │   └── dto/
│   │   │       │       └── validate-key.dto.ts
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
│   │   │   ├── main.ts
│   │   │   ├── preload.ts
│   │   │   ├── ipc/
│   │   │   ├── db/                            # SQLite local
│   │   │   ├── sync/                          # motor de sincronização
│   │   │   ├── security/
│   │   │   └── updater/
│   │   └── src/
│   │       ├── pages/
│   │       ├── components/
│   │       └── services/
│   │
│   └── landing/                              # site de distribuição/download
│       └── src/
│           └── pages/
│               └── download/                 # validação da chave (createServerFn)
│
└── packages/
    └── shared-types/                         # tipos e DTOs partilhados
        ├── academy.types.ts
        ├── athlete.types.ts
        └── ...
```

---

## Distribuição da App Desktop

As academias afiliadas fazem o download do app desktop no site de distribuição **ATA-RUYU.com** inserindo uma **chave de download física entregue num envelope selado** na sede central — semelhante a um cartão pré-pago.

---

## Roles e Permissões

| Role | Âmbito | Acesso |
|---|---|---|
| `CENTRAL` | Global | Acesso total a todas as academias e relatórios |
| `ADMIN_DEV` | Global | Administração técnica da plataforma |
| `AFFILIATE_ADMIN` | Academia própria | Gestão completa da sua academia |

---

## Modelo de Subscrição (actual)

As academias (CENTRAL e FILIAL) pagam uma mensalidade de **35.500 KZ** para manter o acesso à plataforma. Em caso de falta de pagamento:

1. Estado passa para `PAST_DUE`
2. Após 7 dias de período de graça → `SUSPENDED`
3. O acesso à app desktop é bloqueado ao nível do guard até a dívida ser regularizada

---

## Modelo de Monetização — Análise para o Mercado Angolano

> Esta secção é uma análise de viabilidade comercial, não uma auditoria técnica. As probabilidades apresentadas são estimativas qualitativas fundamentadas em dados de mercado disponíveis publicamente, não previsões estatísticas — devem ser lidas como cenários de raciocínio, não como certezas.

### 1. Contexto macroeconómico relevante

| Indicador | Valor | Implicação para o ATA-Ryu |
|---|---|---|
| População de Angola | ≈ 39,3 milhões (fim de 2025) | Mercado potencial grande em termos absolutos, mas BJJ é um nicho dentro de um nicho (artes marciais) |
| Penetração de internet | ≈ 44,8% da população (17,6 milhões de utilizadores) | Mais de metade do país está offline — reforça a decisão acertada de a app ser **offline-first** |
| Cobertura móvel | ≈ 75-78% da população | A maioria tem telemóvel mesmo sem internet fixa — pagamentos por mobile money/transferência são mais viáveis do que dependência de cartão |
| População urbana | ≈ 70% | BJJ como desporto é tipicamente urbano/classe média — Luanda concentra provavelmente a maioria das academias endereçáveis |
| Câmbio USD/AOA | ≈ 910–940 Kz por 1 USD (meados de 2026), com histórico de forte volatilidade (subiu de ≈508 Kz em maio de 2023 para a faixa actual) | Um preço fixo em Kwanza perde valor real rapidamente se o Kwanza continuar a desvalorizar; um preço indexado ao USD protege a receita da empresa mas transfere o risco cambial para a academia |
| Inflação (CPI) | Pico de ≈26,5% (início de 2025), recuando para ≈18,9% em meados de 2025, ainda alta face a padrões internacionais | Preços fixos em Kwanza corroem-se rapidamente; contratos anuais sem cláusula de reajuste são arriscados para o fornecedor |
| População abaixo da linha de pobreza | ≈32% (linha nacional) a ≈53% (< 3,65 USD/dia) | O público-alvo realista não é "a população", é a fatia urbana com rendimento disponível para pagar uma actividade extracurricular paga — um subconjunto muito mais pequeno |
| PIB per capita (nominal) | ≈ 4.100 USD/ano | Situa Angola como economia de rendimento médio-baixo — poder de compra para software B2B é limitado fora de empresas maiores |

**Leitura combinada:** o ATA-Ryu está a construir para um mercado com boa cobertura móvel mas internet fixa fraca, alta volatilidade cambial, inflação ainda elevada, e um público pagador concentrado numa fatia urbana e economicamente mais estável da população. A arquitectura offline-first já responde bem ao primeiro ponto; os pontos cambiais e inflacionários ainda não estão reflectidos no modelo de preço actual (fixo em Kwanza).

### 2. Crítica ao modelo actual

O modelo actual — mensalidade fixa de 35.500 Kz (≈ 38–39 USD ao câmbio de meados de 2026) cobrada **por igual à Central e a cada afiliada** — tem méritos e limitações claras:

**Méritos:**
- Simples de comunicar e de cobrar.
- Previsível para efeitos de orçamento da academia.
- Alinhado com o facto de ser, na prática, uma taxa de filiação obrigatória à rede Aliança do Tatame, não um SaaS vendido a estranhos — isto é uma vantagem estrutural importante (ver secção 4).

**Limitações:**
- **Preço fixo em Kwanza, sem indexação**, num país com inflação de dois dígitos e câmbio volátil — a receita real da empresa (em USD, se houver custos em USD como infraestrutura cloud) deprecia-se com o tempo salvo reajuste manual frequente.
- **Preço uniforme independentemente do tamanho da academia** — uma academia com 20 atletas paga o mesmo que uma com 300. Isto castiga desproporcionalmente as academias pequenas/novas (barreira de entrada) e deixa dinheiro na mesa nas academias grandes.
- **Nenhuma componente variável ligada a uso ou a valor entregue** (nº de atletas, campeonatos organizados, relatórios avançados).
- **A Central paga a mesma mensalidade que as filiais**, o que é estranho do ponto de vista de modelo de negócio — a Central é a dona da plataforma; mais plausível é que a "mensalidade" da Central seja, na prática, uma forma de justificar contabilisticamente o custo de operação da plataforma, não uma verdadeira receita de SaaS.

### 3. Dimensionamento do mercado (TAM/SAM/SOM) — estimativa aproximada

Não existem dados públicos fiáveis sobre o número exacto de academias de BJJ em Angola; os números abaixo são **estimativas de ordem de grandeza** para efeitos de raciocínio, não dados de mercado verificados, e devem ser validados com dados reais da Aliança do Tatame antes de qualquer decisão de preço.

- **TAM (Total Addressable Market):** todas as academias de artes marciais/desportos de combate em Angola dispostas a adoptar software de gestão — plausivelmente dezenas de academias a nível nacional, concentradas nas grandes cidades (Luanda, Benguela, Huambo, Lubango).
- **SAM (Serviceable Addressable Market):** academias especificamente de BJJ ou grappling, filiadas ou filiáveis à rede Aliança do Tatame — um subconjunto claramente mais pequeno que o TAM, dado que o ATA-Ryu está desenhado à volta da estrutura hierárquica desta rede específica, não como ferramenta genérica para qualquer academia.
- **SOM (Serviceable Obtainable Market) nos primeiros 2–3 anos:** o número de academias que a Aliança do Tatame conseguir efectivamente aprovar, aprovisionar com chave física e reter activas — este é o número que realmente importa para a receita, e depende mais da capacidade operacional/comercial da Central do que da qualidade do software.

**Implicação central:** este não é um SaaS de mercado aberto competindo por aquisição de clientes — é essencialmente **software cativo de uma rede de franchising**. O "mercado" relevante não é "quantas academias existem em Angola", é "quantas academias a Aliança do Tatame consegue recrutar para a sua rede", o que muda fundamentalmente a análise de risco (ver secção 5).

### 4. Modelo de monetização proposto

Recomenda-se evoluir de mensalidade única fixa para um modelo em camadas, mantendo a simplicidade que o mercado angolano exige:

**a) Preço base indexado, não fixo**
Definir o preço em USD (ex.: 35–40 USD) e converter para Kwanza no momento da facturação, com revisão trimestral do valor em Kz — protege a margem real sem exigir do cliente que pague em moeda estrangeira.

**b) Escalões por número de atletas activos**
Ex.: Starter (até 50 atletas), Growth (51–150), Established (150+) — com o mesmo produto, apenas o preço a escalar. Isto reduz a barreira de entrada para academias pequenas/novas (fundamental numa economia com poder de compra limitado) e capta mais valor das academias grandes, que já têm a operação mais complexa e mais a ganhar com o software.

**c) Taxa de activação separada da mensalidade**
Cobrar a chave física de activação (o "cartão pré-pago") como uma pequena taxa única de adesão, distinta da mensalidade recorrente — clarifica contabilisticamente o que é custo de aquisição/onboarding vs. receita recorrente.

**d) Módulos opcionais (upsell) em vez de tudo incluído**
Relatórios avançados/exportação, gestão de múltiplos campeonatos simultâneos, ou funcionalidades específicas da Central (analytics de rede) podem ser add-ons pagos acima do plano base — mantém o plano de entrada acessível e cria uma segunda linha de receita para as academias mais maduras.

**e) Reconsiderar a mensalidade da Central**
Separar claramente "custo de operação da plataforma" (interno, não deveria ser uma "mensalidade" formal) de eventuais receitas verdadeiramente comerciais que a Central obtenha (ex.: taxa sobre inscrições pagas em campeonatos organizados através da plataforma).

**f) Desconto por pagamento anual antecipado**
Em economias inflacionárias, receber um ano adiantado é vantajoso para o fornecedor (protege contra atraso de pagamento e reduz custo de cobrança) — oferecer desconto (ex.: 1–2 meses grátis) para quem paga o ano completo à cabeça.

### 5. Riscos específicos do mercado angolano

| Risco | Natureza | Gravidade estimada |
|---|---|---|
| Dependência de uma única rede (Aliança do Tatame) | O produto está desenhado à volta da hierarquia de uma organização específica — se essa organização não crescer ou perder relevância no meio do BJJ angolano, o software não tem mercado alternativo óbvio sem re-arquitectura | **Alta** — é o maior risco estrutural do projecto |
| Poder de compra do público-alvo | ≈32–53% da população abaixo de linhas de pobreza distintas; BJJ é uma actividade paga, logo o público real é mais restrito, mas as academias em si (o cliente pagador do SaaS) podem ainda assim ter fluxo de caixa apertado, sobretudo fora de Luanda | **Média-Alta** |
| Volatilidade cambial e inflação | Erosão do valor real de um preço fixo em Kwanza; risco de a academia sentir "aumento de preço" mesmo sem reajuste nominal, por comparação ao custo de vida | **Média** — mitigável com indexação (secção 4a) |
| Conectividade fora dos grandes centros | Penetração de internet de ≈45% a nível nacional, com fortes assimetrias entre Luanda e o interior | **Baixa a Média** — já mitigado pela arquitectura offline-first, mas continua a exigir distribuição física de instaladores/chaves, o que tem custo logístico |
| Concorrência | Não há evidência de concorrentes directos especializados em BJJ/artes marciais em Angola; o risco mais realista é concorrência indirecta de folhas de cálculo/WhatsApp/papel, que é "grátis" mas ineficiente — o inimigo real é a inércia, não outro SaaS | **Baixa a Média** |
| Capacidade operacional da Central para recrutar e reter afiliadas | Como o software é cativo da rede, o crescimento da receita depende inteiramente da capacidade comercial/operacional da Aliança do Tatame em expandir a rede — não é um problema resolvível apenas com engenharia de software | **Alta** |

### 6. Cenários e probabilidades estimadas

Estes valores são **estimativas de raciocínio qualitativo**, não resultado de um modelo estatístico ou de dados de mercado validados — servem para estruturar a discussão de risco, não como previsão. Devem ser revistos assim que existirem números reais de adesão da Aliança do Tatame.

| Cenário | Descrição resumida | Probabilidade estimada |
|---|---|---|
| **Sucesso limitado, mas sustentável** | A rede cresce de forma modesta (dezenas de academias), a mensalidade cobre custos de operação e gera margem pequena mas positiva; o produto sobrevive como ferramenta interna valiosa da Aliança do Tatame, sem grande expansão além dela | **≈ 40–45%** — é o cenário mais provável dado que o software já tem um cliente cativo (a própria rede) e não depende de aquisição de mercado aberto |
| **Fracasso por adopção insuficiente** | A rede não cresce o suficiente para gerar massa crítica de academias pagantes; custo de manter a infraestrutura e o desenvolvimento excede a receita; produto é descontinuado ou reduzido a uso interno mínimo | **≈ 25–30%** — risco real dado o tamanho pequeno do nicho (BJJ em Angola) e a dependência de uma única organização |
| **Sucesso expressivo com expansão** | A Aliança do Tatame consolida-se como referência do BJJ angolano, a rede cresce significativamente, e o software eventualmente evolui para servir outras artes marciais/desportos de combate fora da rede original, tornando-se um SaaS vertical mais amplo | **≈ 15–20%** — possível, mas exige decisões de produto e de negócio (abrir a plataforma a academias fora da Aliança do Tatame) que ainda não estão no âmbito actual |
| **Estagnação prolongada** | Nem cresce nem fracassa claramente — mantém-se um número pequeno e estável de academias, cobre custos, mas nunca se torna um negócio de escala relevante | **≈ 10–15%** |

**Nota metodológica:** a soma aproxima-se de 100% por construção destes quatro cenários serem mutuamente exclusivos e razoavelmente exaustivos; não interprete os números como provenientes de um modelo actuarial — são uma forma estruturada de comunicar que o cenário mais provável é "sobrevivência modesta como ferramenta cativa", não "grande sucesso comercial" nem "fracasso total", e que o factor decisivo é a capacidade de crescimento da própria rede Aliança do Tatame, mais do que a qualidade técnica do software.

### 7. Recomendações-chave

1. Validar o número real e a taxa de crescimento de academias na rede Aliança do Tatame antes de qualquer projecção financeira formal — os TAM/SAM/SOM acima são placeholders de raciocínio, não dados.
2. Indexar o preço ao USD com revisão trimestral em Kwanza, para proteger a margem da erosão inflacionária/cambial.
3. Introduzir escalões de preço por número de atletas, reduzindo a barreira de entrada para academias pequenas.
4. Separar claramente, na contabilidade, a "mensalidade" da Central (custo interno) de receita comercial real.
5. Considerar, a médio prazo, se existe apetite estratégico para abrir a plataforma a academias fora da Aliança do Tatame — é a alavanca com maior potencial de transformar isto de "ferramenta cativa" em "negócio de SaaS vertical" propriamente dito, mas implica mudanças de produto (multi-organização) e de posicionamento.

---

## Custos Operacionais até à Produção

> Estimativas de ordem de grandeza para orçamentação, não uma cotação de fornecedor. Valores em Kwanza ao câmbio de referência de **≈ 925 Kz/USD** (meados de 2026, faixa observada de 910–940). Dado o histórico de volatilidade cambial de Angola, estes valores em Kz devem ser tratados como uma fotografia do momento, não como números fixos — reveja-os sempre que o câmbio se mover de forma relevante. Assume-se uma equipa pequena (2–4 pessoas) a levar o projecto do estado actual até uma primeira versão em produção com um número reduzido de academias piloto — não o custo de uma equipa de SaaS já escalado.

### 1. Desenvolvimento (custo dominante)

| Item | Estimativa | Nota |
|---|---|---|
| Engenharia (backend + desktop + landing), até MVP em produção | maior componente de custo, tipicamente meses-pessoa de trabalho | Se for equipa própria já contratada/sócia, este é custo de oportunidade, não desembolso directo — mas deve constar de qualquer avaliação séria do projecto |
| Design de UI/UX (já em grande parte definido pelos prompts existentes) | esforço menor se seguir os prompts já produzidos, maior se exigir iteração visual profissional | |
| QA / testes manuais e automatizados | recorrente, cresce com o número de módulos (pagamentos, presenças, graduações, campeonatos) | Actualmente só `auth` e `athletes` têm specs — este é trabalho em falta, não opcional |

### 2. Infra-estrutura e serviços recorrentes (mensal, em produção)

| Item | Estimativa mensal (Kz) | Nota |
|---|---|---|
| Hosting da API (VPS/cloud pequeno, ex. DigitalOcean/AWS/Azure tier básico) | ≈ 9.000–37.000 | Depende de tráfego; início com poucas academias cabe num único servidor pequeno |
| Base de dados PostgreSQL gerida (ou self-hosted no mesmo servidor) | ≈ 0–23.000 | 0 se self-hosted no mesmo VPS inicialmente |
| Domínio(s) (ATA-RUYU.com + eventuais subdomínios) | ≈ 900–2.800 | Custo anual diluído |
| Certificado de assinatura de código (Windows Authenticode / Apple Developer para notarization) | ≈ 277.000–462.000/ano (Windows) + ≈ 91.500/ano (Apple) | Item facilmente esquecido em orçamento — obrigatório para `electron-updater` funcionar com segurança e evitar avisos de SmartScreen/Gatekeeper |
| Armazenamento/CDN para instaladores da app desktop | ≈ 4.600–18.500 | Ficheiros `.exe`/`.dmg` são pesados |
| Serviço de email transacional (recuperação de senha, notificações) | ≈ 0–13.900 | Muitos têm tier gratuito suficiente nesta fase |
| Monitorização/logs (ex. Sentry tier gratuito ou pago) | ≈ 0–24.000 | Recomendado desde cedo dado o requisito de auditoria |
| **Total infra recorrente estimado** | **≈ 14.000–120.000/mês** | Faixa larga porque depende muito de self-host vs. gerido |

### 3. Custos únicos / pré-lançamento

| Item | Estimativa | Nota |
|---|---|---|
| Registo/legalização da empresa em Angola (se ainda não constituída) | variável, depende de taxas locais e assessoria jurídica, tipicamente algumas centenas de milhares de Kz | Fora do âmbito técnico, mas necessário para facturar legalmente às academias |
| Auditoria de segurança independente antes do lançamento (recomendado dado dados sensíveis de menores e financeiros) | esforço equivalente a alguns dias de um especialista, interno ou externo | Pode começar pela auditoria técnica já pedida ao Claude Code, mas uma revisão humana independente antes de produção é boa prática, não substituível integralmente por IA |
| Produção das chaves físicas de activação (impressão dos cartões/envelopes selados) | custo por unidade baixo (algumas centenas de Kz por unidade), mas recorrente conforme a rede cresce | Logística física, não puramente digital |
| Formação/onboarding das primeiras academias piloto | tempo da equipa, não necessariamente custo monetário directo | Crítico para adopção, frequentemente subestimado |

### 4. O que este projecto **não** deveria subestimar

- **Manutenção contínua** — sincronização offline, guards multi-tenant e o motor de update são superfícies que exigem manutenção activa, não são "construir uma vez e esquecer".
- **Suporte às academias** — utilizadores finais tipicamente não-técnicos (instrutores), em zonas com conectividade instável; suporte tem custo humano recorrente que não aparece na infra.
- **Custo de not-doing-it-in-time**: dado o risco cambial identificado na secção de monetização, atrasos no lançamento têm custo de oportunidade real (erosão do preço real se a mensalidade ficar fixa em Kz durante o desenvolvimento — os certificados e serviços acima cotados em USD ficam mais caros em Kz sempre que a moeda local desvaloriza).

---

## Estimativa de Valor do Projecto

> **Aviso:** isto não é uma avaliação profissional de empresa nem aconselhamento de investimento — Claude não é consultor financeiro. É uma estimativa ilustrativa, construída com metodologias standard de avaliação de startups em fase inicial, para dar ordem de grandeza e mostrar o raciocínio. Para uma transacção real (venda, angariação de investimento, entrada de sócio), é necessária uma avaliação profissional independente com acesso a dados financeiros reais da Aliança do Tatame.

Cruzam-se três métodos, todos com fortes limitações dado tratar-se de um projecto pré-receita/early-stage e sem dados financeiros públicos verificáveis:

### Método 1 — Custo de construção (cost-to-build)
Soma aproximada do investimento em engenharia, design e infra-estrutura até à versão em produção (secção anterior). Para um SaaS multi-tenant deste âmbito (API completa + app desktop offline-first + site de distribuição), construído por uma equipa pequena, este valor tende a situar-se numa faixa baixa de **dezenas de milhões de Kz** em custo de oportunidade/trabalho — não é uma plataforma trivial (a camada offline-first e multi-tenant tem complexidade real), mas também está longe da escala de um SaaS com múltiplas equipas.

Este método dá um **valor mínimo defensável** (quanto custaria refazer do zero), não o valor de mercado.

### Método 2 — Múltiplo de receita (revenue multiple)
Startups SaaS early-stage transaccionam tipicamente entre **2× a 5× ARR** (receita anual recorrente), com múltiplos mais baixos em mercados emergentes, baixa diversificação de clientes, e forte dependência de uma única organização-mãe (todos aplicáveis aqui).

Usando os números do modelo de subscrição actual como referência (35.500 Kz/mês por academia):

| Nº de academias pagantes activas | ARR aproximado (Kz) | Valor estimado a 2–3× ARR (Kz) |
|---|---|---|
| 10 | ≈ 4.260.000 | ≈ 8.500.000–12.800.000 |
| 30 | ≈ 12.780.000 | ≈ 25.600.000–38.300.000 |
| 100 | ≈ 42.600.000 | ≈ 85.200.000–127.800.000 |

Estes números mostram claramente que, **na escala actual e provável (secção de monetização, cenário mais provável de dezenas de academias)**, o valor financeiro puro do SaaS em si é modesto — a faixa mais realista de curto prazo situa-se plausivelmente entre **~9 e ~40 milhões de Kz** de valor "SaaS", não centenas de milhões, salvo expansão significativa da rede ou abertura a academias fora da Aliança do Tatame.

### Método 3 — Valor estratégico para a Aliança do Tatame (não puramente financeiro)
Este é o ponto mais importante e frequentemente ignorado em avaliações puramente financeiras: o ATA-Ryu não é (ainda) um negócio SaaS independente — é **infra-estrutura operacional proprietária de uma rede de franchising**. O seu valor real para a Aliança do Tatame não está apenas na receita de mensalidades, mas em:

- Custo evitado de gerir centenas de academias manualmente (folhas de cálculo, WhatsApp, papel).
- Controlo e visibilidade centralizados que permitem à rede crescer com confiança (sem isto, escalar a rede seria operacionalmente mais arriscado).
- Diferenciação competitiva da Aliança do Tatame frente a outras redes/academias independentes — "somos a rede com sistema de gestão profissional" é um argumento de recrutamento de novas afiliadas.

Este valor estratégico é real mas **difícil de quantificar em Kz** sem dados internos (quanto custaria à Central operar sem o sistema, quantas afiliadas adicionais o sistema ajuda a recrutar/reter).

### Síntese

| Método | Estimativa | Fiabilidade |
|---|---|---|
| Custo de construção | dezenas de milhões de Kz (faixa baixa) | Razoavelmente sólida — é a menos especulativa |
| Múltiplo de receita (ARR actual/provável) | ≈ 9.000.000–40.000.000 Kz na escala mais provável | Sensível a nº real de academias pagantes, que não está validado (ver secção de monetização) |
| Valor estratégico para a Aliança do Tatame | não quantificável com os dados disponíveis | Provavelmente o componente mais importante, mas exige dados internos para estimar |

**Leitura honesta:** enquanto ferramenta interna de uma única rede em fase inicial, o valor financeiro "de mercado" do ATA-Ryu como activo transaccionável isolado é modesto (dezenas de milhões de Kz, não mais). O seu valor real está concentrado em quão indispensável se torna para a operação e crescimento da Aliança do Tatame — o que é uma questão de negócio, não de código, e só se confirma com adopção real ao longo do tempo.

---

## Segurança e Multi-tenancy

- Todos os queries são obrigatoriamente filtrados por `academyId` — a Academia A nunca acede a dados da Academia B.
- Autenticação JWT com refresh tokens e 2FA opcional via OTP.
- Estado da subscrição da academia verificado ao nível do guard em cada request (`academy-status.guard.ts`).
- Log de auditoria completo de todas as acções críticas.
- App desktop offline-first com SQLite local, sincronização incremental, e camada de segurança dedicada (cofre de credenciais do SO, encriptação em repouso, IPC validado, assinatura de código nos instaladores).
- Validação de chave de activação no site de distribuição via `createServerFn` com rate limiting, comparação em tempo constante (`timingSafeEqual`) e respostas genéricas em caso de falha.

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

## Licença

Privado — Todos os direitos reservados · Aliança do Tatame Angola · 2026