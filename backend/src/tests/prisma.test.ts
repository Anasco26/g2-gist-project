import prisma from "../db/prisma";

describe("Prisma", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("connects to the local PostgreSQL server", async () => {
    await expect(prisma.$connect()).resolves.toBeUndefined();
  });
});
