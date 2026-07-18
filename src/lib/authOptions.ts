import type { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/db';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.sub) return false;
      await prisma.player.upsert({
        where: { id: profile.sub },
        update: { email: profile.email ?? null, name: profile.name ?? null, picture: (profile as { picture?: string }).picture ?? null },
        create: {
          id: profile.sub,
          email: profile.email ?? null,
          name: profile.name ?? null,
          picture: (profile as { picture?: string }).picture ?? null,
        },
      });
      return true;
    },
    async jwt({ token, profile }) {
      if (profile?.sub) token.playerId = profile.sub;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.playerId as string | undefined;
      }
      return session;
    },
  },
};
