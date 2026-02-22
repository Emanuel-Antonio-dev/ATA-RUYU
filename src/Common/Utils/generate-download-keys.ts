import { randomBytes } from "node:crypto";

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SEGMENT_LENGTH = 4
const SEGMENT_COUNT = 4

function generateSegment(): string {
    const bytes = randomBytes(SEGMENT_LENGTH)
    return Array.from(bytes).map((byte)=> CHARSET[byte % CHARSET.length]).join('')
}
function generateDownloadKey(): string{
    return Array.from({length: SEGMENT_COUNT},generateSegment).join('')
}
export{generateDownloadKey}