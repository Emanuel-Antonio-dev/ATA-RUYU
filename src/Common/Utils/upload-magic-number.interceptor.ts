import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnprocessableEntityException } from "@nestjs/common";
import { Observable } from "rxjs";
import * as fs from "fs";

/**
 * ✅ Complemento a V-06: a whitelist de extensão/mimetype (`multer-config.ts`)
 * já impede gravar/servir um `.html`/script disfarçado de imagem — mas um
 * `fileFilter` do multer só vê o `Content-Type` que o CLIENTE declarou no
 * pedido, que pode mentir (um ficheiro de texto/HTML enviado com
 * `Content-Type: image/jpeg` passa a whitelist sem problema, mesmo já não
 * podendo ser servido como HTML). Este interceptor lê os primeiros bytes do
 * ficheiro já gravado em disco e confirma que correspondem à assinatura
 * (magic number) real de um dos formatos permitidos — defesa em
 * profundidade, independente do que o cliente tenha declarado.
 *
 * Corre DEPOIS do `FileInterceptor` do multer (que já escreveu o ficheiro
 * em disco) e ANTES do handler da rota — se a assinatura não bater
 * certo, apaga o ficheiro e rejeita o pedido.
 */
const SIGNATURES: { mime: string; check: (buf: Buffer) => boolean }[] = [
  { mime: "image/jpeg", check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png",  check: (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a },
  { mime: "image/webp", check: (b) => b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  { mime: "application/pdf", check: (b) => b.length >= 5 && b.toString("ascii", 0, 5) === "%PDF-" },
];

function matchesDeclaredType(buffer: Buffer, declaredMime: string): boolean {
  // aceita jpeg/jpg como o mesmo formato de facto
  const normalized = declaredMime === "image/jpg" ? "image/jpeg" : declaredMime;
  const signature = SIGNATURES.find((s) => s.mime === normalized);
  // se não houver assinatura conhecida para o tipo declarado, não bloqueia
  // aqui (a whitelist de mimetype já cobriu isso) — só bloqueia uma
  // incompatibilidade CONFIRMADA entre o conteúdo real e o que foi
  // declarado.
  if (!signature) return true;
  return signature.check(buffer);
}

function validateFile(file: Express.Multer.File) {
  const buffer = fs.readFileSync(file.path, { flag: "r" }).subarray(0, 12);
  if (!matchesDeclaredType(buffer, file.mimetype)) {
    fs.unlinkSync(file.path);
    throw new UnprocessableEntityException(
      `O conteúdo do ficheiro "${file.originalname}" não corresponde ao tipo declarado (${file.mimetype}).`,
    );
  }
}

@Injectable()
export class UploadMagicNumberInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.file) {
      validateFile(request.file);
    }
    if (Array.isArray(request.files)) {
      request.files.forEach(validateFile);
    } else if (request.files && typeof request.files === "object") {
      Object.values(request.files).forEach((group: any) => (group as Express.Multer.File[]).forEach(validateFile));
    }

    return next.handle();
  }
}
