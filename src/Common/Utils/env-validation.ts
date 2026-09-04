// ✅ 5.3 / B-16 FIX: a aplicação lia ~25 variáveis de ambiente espalhadas
// por serviços, repositórios e seeds, sem qualquer validação — o sintoma
// mais visível era B-16 (`Number(process.env.SUBSCRIPTION_AMOUNT_AOA)`
// virava `NaN` sem a env var definida, e o Prisma só rejeitava a escrita
// do `Decimal` a meio de um pedido de pagamento real). Esta validação
// corre uma vez, no arranque — a aplicação recusa arrancar se faltar
// alguma variável crítica, em vez de falhar de forma imprevisível mais
// tarde, a meio de um pedido.
//
// Não converte todo o acesso a `process.env.X` para `ConfigService` em
// cada ficheiro (refactor maior, com mais risco do que benefício de
// segurança adicional face a esta validação de arranque) — mantém o
// padrão já usado no resto do código, só garante que, quando um `process.env.X`
// é lido, a variável já foi confirmada presente.
export interface EnvironmentVariables {
  DATABASE_URL: string;
  JWT_SECRET: string;

  SUBSCRIPTION_AMOUNT_AOA: string;
  SUBSCRIPTION_CURRENCY: string;

  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
}

const REQUIRED_VARS: (keyof EnvironmentVariables)[] = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SUBSCRIPTION_AMOUNT_AOA',
  'SUBSCRIPTION_CURRENCY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
];

export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (config[key] === undefined || config[key] === null || config[key] === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Configuração inválida — variáveis de ambiente em falta: ${missing.join(', ')}. ` +
      `Verifique o ficheiro .env (ver .env.example).`,
    );
  }

  if (isNaN(Number(config.SUBSCRIPTION_AMOUNT_AOA))) {
    throw new Error(
      `SUBSCRIPTION_AMOUNT_AOA deve ser um número válido — valor actual: "${config.SUBSCRIPTION_AMOUNT_AOA}"`,
    );
  }

  if (isNaN(Number(config.SMTP_PORT))) {
    throw new Error(
      `SMTP_PORT deve ser um número válido — valor actual: "${config.SMTP_PORT}"`,
    );
  }

  return config;
}
