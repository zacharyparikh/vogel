import { clerkClient } from '@clerk/nextjs/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const profileRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      try {
        const [user] = await clerkClient.users.getUserList({
          username: [input.username],
        });

        if (!user) {
          throw new Error();
        }

        const { id, username, profileImageUrl } = user;

        if (!username) {
          throw new Error();
        }

        return { id, username, profileImageUrl };
      } catch {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
    }),
});
