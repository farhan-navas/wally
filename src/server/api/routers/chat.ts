import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
  // creates a chat for the user and configures the profile for the current chat and pushes new chat to the db
  createChat: protectedProcedure
    .input(
      z.object({
        chatHeader: z.string(),
        name: z.string(),
        gender: z.string(),
        birthDate: z.string().date().optional(),
        relationship: z.string(),
        heartLevel: z.number().int(),
        race: z.string().optional(),
        country: z.string().optional(),
        language: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId;
      const {
        chatHeader,
        name,
        gender,
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
          gender,
          birthDate: birthDate ? new Date(birthDate) : null,
          relationship,
          heartLevel,
          race,
          country,
          language,
        },
      });

      return newChat;
    }),

  // update the current chat's profile details and pushes changes to the db
  updateChat: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        chatHeader: z.string().optional(),
        name: z.string().optional(),
        gender: z.string().optional(),
        birthDate: z.string().date().optional(),
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
        data: {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
        },
      });

      return updatedChat;
    }),

  // delete the current chat and all messages associated with it
  deleteChat: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const chat = await ctx.db.chat.delete({
          where: { id: input.chatId },
        });

        return chat;
      } catch (Error) {
        console.log("Failed to delete chat: ", Error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete chat",
        });
      }
    }),

  // get all chat details for the user, to display on the chat page
  getChat: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chat = await ctx.db.chat.findUnique({
        where: {
          id: input.chatId,
        },
      });

      return chat;
    }),

  // get all chat headers for the user, to display on the home page (should only be called ONCE upon login or refresh)
  getAllChatHeaders: protectedProcedure.query(async ({ ctx }) => {
    const headers = await ctx.db.chat.findMany({
      where: {
        userId: ctx.session.userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        chatHeader: true,
        name: true,
        gender: true,
        birthDate: true,
        relationship: true,
        heartLevel: true,
        race: true,
        country: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return headers;
  }),
});
