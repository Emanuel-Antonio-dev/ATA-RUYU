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

function generateAffiliateNumber(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ATA-${String(random).padStart(4, '0')}`;
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export { generateDownloadKey, generateAffiliateNumber, hashKey};