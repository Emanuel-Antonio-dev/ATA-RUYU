// src/Common/Utils/Uploads/multer-config.ts

import { BadRequestException } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { Request } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";

const pathDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(pathDir)) fs.mkdirSync(pathDir, { recursive: true });

const directories = {
  AcademyLogos: "AcademyLogos",
  AthletePhotos: "AthletePhotos",
  UserPhotos: "UserPhotos",
  PaymentReceipts: "PaymentReceipts",
} as const;

type DirectoryKey = keyof typeof directories;

Object.values(directories).forEach((dir) => {
  const fullPath = path.join(pathDir, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const allowedMimes: Record<DirectoryKey, string[]> = {
  // ✅ V-06 FIX: `image/svg+xml` removido — SVG pode conter <script>
  // embutido e é um vector de XSS armazenado conhecido, mesmo servido com
  // o Content-Type correto (ex: ao ser aberto directamente na mesma
  // origem). Se um logótipo em SVG for mesmo necessário no futuro, deve
  // ser sempre servido com `Content-Disposition: attachment`, nunca inline.
  AcademyLogos: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  AthletePhotos: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  UserPhotos: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  PaymentReceipts: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
};

// ✅ V-06 FIX: mapa fixo de mimetype → extensão. A extensão gravada em
// disco passa a vir SEMPRE daqui, nunca de `file.originalname` (controlado
// pelo atacante). Antes, enviar "payload.html" com um Content-Type de
// imagem gravava (e servia, em /uploads) um ficheiro .html na mesma
// origem da aplicação — execução de JavaScript com acesso a cookies/
// localStorage de sessões activas. Com a extensão fixa por mimetype, o
// ficheiro gravado é sempre .jpg/.png/.webp/.pdf, e é servido com o
// Content-Type correspondente a essa extensão, nunca como text/html.
const extensionByMime: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

const maxFileSizes: Record<DirectoryKey, number> = {
  AcademyLogos: 2 * 1024 * 1024,
  AthletePhotos: 5 * 1024 * 1024,
  UserPhotos: 5 * 1024 * 1024,
  PaymentReceipts: 10 * 1024 * 1024,
};

// ── Storage ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const folder = directories[file.fieldname as DirectoryKey];
    if (!folder) {
      return cb(
        new Error(JSON.stringify({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Campo de upload inválido: ${file.fieldname}`,
        })),
        ""
      );
    }
    cb(null, path.join(pathDir, folder));
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // ✅ V-06 FIX: extensão derivada do mimetype validado (`extensionByMime`),
    // nunca de `file.originalname`. Se por algum motivo o mimetype não
    // estiver mapeado (não deveria acontecer — `fileFilter` já rejeitou
    // mimetypes fora da lista branca antes deste callback correr), recusa
    // em vez de cair de volta para a extensão do cliente.
    const ext = extensionByMime[file.mimetype];
    if (!ext) {
      return cb(new Error(JSON.stringify({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: `Tipo de ficheiro não suportado.`,
      })), "");
    }
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// ── FileFilter ───────────────────────────────────────────
const fileFilter: MulterOptions["fileFilter"] = (req, file, cb) => {
  const allowed = allowedMimes[file.fieldname as DirectoryKey];
  if (!allowed) {
    return cb(
      new Error(JSON.stringify({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Campo de upload não reconhecido: ${file.fieldname}`,
      })),
      false
    );
  }

  if (!allowed.includes(file.mimetype)) {
    return cb(
      new Error(JSON.stringify({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: `Tipo de ficheiro inválido para ${file.fieldname}. Permitido: ${allowed.join(", ")}`,
      })),
      false
    );
  }

  cb(null, true);
};

// ── MulterOptions exportadas ─────────────────────────────
// ✅ B-14 FIX: antes, `limits.fileSize` usava o MAIOR valor de
// `maxFileSizes` (10 MB) para TODOS os campos — a tabela por tipo
// (2 MB para logótipos, 5 MB para fotografias) era só decorativa,
// nunca chegava a ser aplicada. `getUploaderOptions(field)` devolve
// opções com o limite correcto para esse campo específico; cada
// controller passa o seu próprio directory key em vez do objecto
// partilhado único.
export function getUploaderOptions(field: DirectoryKey): MulterOptions {
  return {
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSizes[field],
    },
  };
}

export { directories, pathDir };
export type { DirectoryKey };