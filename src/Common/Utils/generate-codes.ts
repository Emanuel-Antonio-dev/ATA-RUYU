import { randomBytes, createHash} from "node:crypto";

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SEGMENT_LENGTH = 4;
const SEGMENT_COUNT = 5; // 4 segmentos de 5 = 20 dígitos

function generateSegment(): string {
  const bytes = randomBytes(SEGMENT_LENGTH);
  return Array.from(bytes).map((byte) => CHARSET[byte % CHARSET.length]).join('');
}

function generateDownloadKey(): string {
  const segments = Array.from({ length: SEGMENT_COUNT }, generateSegment).join('-');
  return `ATA-${segments}`; // ATA-XXXX-XXXX-XXXX
}

// ✅ B-07 FIX: gerava só 9.000 valores possíveis (`1000 + Math.random()*9000`)
// com `Math.random()` — não criptográfico e previsível, ao contrário do
// `randomBytes` já usado (correctamente) em `generateSegment`. Além disso,
// o mesmo gerador era reutilizado tanto para o `affiliateNumber` da
// academia como para o `affiliateCode` do atleta — dois espaços de valores
// diferentes com o mesmo prefixo "ATA-", indistinguíveis à vista. Agora:
// 8 caracteres do mesmo CHARSET (33^8 ≈ 1,7 × 10¹² combinações) e um
// prefixo próprio para cada entidade.
function generateAffiliateNumber(): string {
  const bytes = randomBytes(8);
  const code = Array.from(bytes).map((byte) => CHARSET[byte % CHARSET.length]).join('');
  return `ATA-${code}`;
}

// código de afiliação do ATLETA — prefixo "ALT" distinto do da academia
// ("ATA"), consistente com o formato descrito no documento de visão
// (ALT-...). Mesma entropia alargada do generateAffiliateNumber.
function generateAthleteAffiliateCode(): string {
  const bytes = randomBytes(8);
  const code = Array.from(bytes).map((byte) => CHARSET[byte % CHARSET.length]).join('');
  return `ALT-${code}`;
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export { generateDownloadKey, generateAffiliateNumber, generateAthleteAffiliateCode, hashKey};