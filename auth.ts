import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";

async function generateUsername(email: string): Promise<string> {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const normalized = base.length >= 3 ? base : `user_${base}`;
  let username = normalized;
  let suffix = 0;
  while (
    await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })
  ) {
    suffix += 1;
    username = `${normalized}_${suffix}`;
  }
  return username;
}

const baseAdapter = PrismaAdapter(prisma) as Adapter;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: {
    ...baseAdapter,
    async createUser(user) {
      if (!user.email) {
        throw new Error("이메일이 없는 OAuth 응답은 처리할 수 없습니다.");
      }
      const username = await generateUsername(user.email);
      const created = await prisma.user.create({
        data: {
          email: user.email,
          emailVerified: user.emailVerified ?? null,
          name: user.name ?? null,
          image: user.image ?? null,
          username,
        },
      });
      return created as AdapterUser;
    },
  },
  session: { strategy: "jwt" },
  providers: [Google],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, username: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.username) session.user.username = token.username as string;
      return session;
    },
  },
});
