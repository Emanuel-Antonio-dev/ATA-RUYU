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
  AcademyLogos: ["image/jpeg", "image/png", "image/jpg", "image/svg+xml", "image/webp"],
  AthletePhotos: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  UserPhotos: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  PaymentReceipts: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
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
    const ext = path.extname(file.originalname).toLowerCase();
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
export const uploaderOptions: MulterOptions = {
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(...Object.values(maxFileSizes)),
  },
};

export { directories, pathDir };
export type { DirectoryKey };