import { resetDatabase } from "./prisma.instance";
import { PrismaService } from "../../src/lib/prisma.service";

const prismaService = new PrismaService();
beforeEach(async () => {
  await resetDatabase();
  console.clear();
});

afterAll(async () => {
  await prismaService.$disconnect();
});