import { clerkClient } from '@clerk/nextjs/server';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({ take: 100 });

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
});
