import { PrismaService } from "../../src/lib/prisma.service";
import "dotenv/config";

const prisma = new PrismaService();

export async function resetDatabase() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("resetDatabase só pode rodar em ambiente de teste");
  }

await prisma.$executeRawUnsafe(`
  DO $$ DECLARE
    r RECORD;
  BEGIN
    FOR r IN (
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename NOT LIKE '_prisma%'
    ) LOOP
      EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" RESTART IDENTITY CASCADE';
    END LOOP;
  END $$;
`);
}