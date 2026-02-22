// src/common/upload/uploader.config.ts

import { BadRequestException } from "@nestjs/common";
import { Request } from "express";
import fs from "fs";
import multer, { StorageEngine } from "multer";
import path from "path";

// ── DIRECTÓRIO RAIZ ───────────────────────────────────────────
const pathDir = path.resolve(__dirname, "../../uploads");

if (!fs.existsSync(pathDir)) {
  fs.mkdirSync(pathDir, { recursive: true });
}

// ── PASTAS POR CONTEXTO ───────────────────────────────────────
const directories = {
  AcademyLogos:    "AcademyLogos",    // logos das academias
  AthletePhotos:   "AthletePhotos",   // fotos de perfil dos atletas
  UserPhotos:      "UserPhotos",      // fotos de perfil dos utilizadores
  PaymentReceipts: "PaymentReceipts", // comprovativos de pagamento (PDF/imagem)
} as const;

type DirectoryKey = keyof typeof directories;

// Cria as pastas se não existirem
Object.values(directories).forEach((dir) => {
  const fullPath = path.join(pathDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// ── MIME TYPES PERMITIDOS POR PASTA ──────────────────────────
const allowedMimes: Record<DirectoryKey, string[]> = {
  AcademyLogos:    ["image/jpeg", "image/png", "image/jpg", "image/svg+xml", "image/webp"],
  AthletePhotos:   ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  UserPhotos:      ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  PaymentReceipts: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
};

// ── TAMANHO MÁXIMO POR PASTA ──────────────────────────────────
const maxFileSizes: Record<DirectoryKey, number> = {
  AcademyLogos:    2  * 1024 * 1024,  // 2MB
  AthletePhotos:   5  * 1024 * 1024,  // 5MB
  UserPhotos:      5  * 1024 * 1024,  // 5MB
  PaymentReceipts: 10 * 1024 * 1024,  // 10MB
};

// ── STORAGE ───────────────────────────────────────────────────
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const field = file.fieldname as DirectoryKey;
    const folder = directories[field];

    if (!folder) {
      return cb(new BadRequestException(`Campo de upload inválido: ${file.fieldname}`), "");
    }

    cb(null, path.join(pathDir, folder));
  },

  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// ── FILE FILTER ───────────────────────────────────────────────
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const field = file.fieldname as DirectoryKey;
  const allowed = allowedMimes[field];

  if (!allowed) {
    return cb(new BadRequestException(`Campo de upload não reconhecido: ${field}`));
  }

  if (!allowed.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        `Tipo de ficheiro inválido para ${field}. Permitido: ${allowed.join(", ")}`
      )
    );
  }

  cb(null, true);
};

// ── INSTÂNCIA PRINCIPAL ───────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(...Object.values(maxFileSizes)), // usa o maior (10MB)
  },
});

export { upload, directories, pathDir };
export type { DirectoryKey };