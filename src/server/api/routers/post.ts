import { clerkClient } from '@clerk/nextjs/server';
import { TRPCError } from '@trpc/server';
import { Ratelimit } from '@upstash/ratelimit'; // for deno: see above
import { Redis } from '@upstash/redis';
import { z } from 'zod';
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '~/server/api/trpc';

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: '@upstash/ratelimit',
});

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: 'desc' }],
    });

    const users = Object.fromEntries(
      (
        await clerkClient.users.getUserList({
          userId: posts.map((post) => post.authorId),
          limit: 100,
        })
      )
        .flatMap((user) => {
          const { id, username, profileImageUrl } = user;

          if (!username) {
            return [];
          }

          return [{ id, username, profileImageUrl }];
        })
        .map((user) => [user.id, user])
    );

    return posts.map((post) => {
      const author = users[post.authorId];

      if (!author) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Author for Post not found',
        });
      }

      return { post, author };
    });
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji('Only emojis are allowed').min(1).max(280),
      })
    )
    .mutation(async ({ ctx: { userId, prisma }, input: { content } }) => {
      const { success } = await ratelimit.limit(userId);

      if (!success) {
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
      }

      return prisma.post.create({
        data: {
          authorId: userId,
          content,
        },
      });
    }),
});
