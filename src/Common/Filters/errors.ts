import { Response, Request, NextFunction} from "express"
import { HttpException } from "@nestjs/common";
import multer from "multer"

function multerErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Erros do multer
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: err.message,
    });
  }

  // Erros personalizados (HttpException)
  if (err instanceof HttpException) {
    return res.status(err.getStatus()).json({
      success: false,
      statusCode: err.getStatus(),
      message: err.message,
    });
  }

  // Outros erros
  if (err) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Erro ao processar upload do arquivo",
    });
  }

  next();
}
export {multerErrorHandler}