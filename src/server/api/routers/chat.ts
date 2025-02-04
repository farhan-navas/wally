import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const chatRouter = createTRPCRouter({
  createChat: publicProcedure
    .input(
      z.object({
        chatHeader: z.string(),
        name: z.string(),
        birthDate: z.string().date().optional(),
        relationship: z.string(),
        heartLevel: z.number().int(),
        race: z.string().optional(),
        country: z.string().optional(),
        language: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("User not authenticated");
      }

      const userId = ctx.session?.user.id;

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new Error("Invalid userId: User does not exist.");
      }

      const {
        chatHeader,
        name,
        birthDate,
        relationship,
        heartLevel,
        race,
        country,
        language,
      } = input;

      const newChat = await ctx.db.chat.create({
        data: {
          userId,
          chatHeader,
          name,
          birthDate: birthDate ? new Date(birthDate) : null,
          relationship,
          heartLevel,
          race,
          country,
          language,
        },
      });

      return newChat || null;
    }),

  updateChat: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        chatHeader: z.string().optional(),
        name: z.string().optional(),
        birthDate: z.string().optional(),
        relationship: z.string().optional(),
        heartLevel: z.number().int().optional(),
        race: z.string().optional(),
        country: z.string().optional(),
        language: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { chatId, ...updateFields } = input;

      const data = Object.fromEntries(
        Object.entries(updateFields).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      const updatedChat = await ctx.db.chat.update({
        where: { id: chatId },
        data,
      });

      return updatedChat;
    }),

  getChatMessages: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        before: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { chatId, before } = input;
      const messages = await ctx.db.messages.findMany({
        where: {
          chatId,
          createdAt: before ? { lt: new Date(before) } : undefined,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          content: true,
          messageBy: true,
          createdAt: true,
        },
      });

      return messages ?? [];
    }),

  // incomplete sendMessage route
  sendMessage: protectedProcedure.mutation(async ({ ctx, input }) => {
    return;
  }),
});
