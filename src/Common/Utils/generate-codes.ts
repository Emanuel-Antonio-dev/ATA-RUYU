import { randomBytes } from "node:crypto";

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SEGMENT_LENGTH = 4;
const SEGMENT_COUNT = 3; // 3 segmentos de 4 = 12 dígitos

function generateSegment(): string {
  const bytes = randomBytes(SEGMENT_LENGTH);
  return Array.from(bytes).map((byte) => CHARSET[byte % CHARSET.length]).join('');
}

function generateDownloadKey(): string {
  const segments = Array.from({ length: SEGMENT_COUNT }, generateSegment).join('-');
  return `ATA-${segments}`; // ATA-XXXX-XXXX-XXXX
}

function generateAffiliateCode(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ATA-${String(random).padStart(4, '0')}`;
}

export { generateDownloadKey, generateAffiliateCode };