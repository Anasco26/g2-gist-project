import prisma from "../db/prisma";
import { Prisma } from "@prisma/client";

type ContactInput = {
  name: string;
  email: string;
  message: string;
};

export async function submitContact(input: ContactInput) {
  return prisma.contactMessage.create({ data: input });
}

export async function listMessages(
  page = 1,
  limit = 20,
  search = "",
  readFilter?: "read" | "unread",
) {
  const skip = (page - 1) * limit;
  const where: Prisma.ContactMessageWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
    ];
  }

  if (readFilter === "read") where.isRead = true;
  if (readFilter === "unread") where.isRead = false;

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return { messages, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function markAsRead(id: string) {
  return prisma.contactMessage.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function deleteMessage(id: string) {
  await prisma.contactMessage.delete({ where: { id } });
}
