import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import { generateUsername } from "@/lib/username";
import { getRandomAvatarPath } from "@/lib/avatar";

if (process.env.NODE_ENV === "production" && process.env.E2E === "true") {
  throw new Error("E2E credentials provider는 프로덕션에서 활성화할 수 없습니다.");
}

const usernameExists = async (username: string) =>
  (await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  })) !== null;

const baseAdapter = PrismaAdapter(prisma) as Adapter;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: {
    ...baseAdapter,
    async createUser(user) {
      if (!user.email) {
        throw new Error("이메일이 없는 OAuth 응답은 처리할 수 없습니다.");
      }
      const username = await generateUsername(user.email, usernameExists);
      const created = await prisma.user.create({
        data: {
          email: user.email,
          emailVerified: user.emailVerified ?? null,
          name: user.name ?? null,
          image: getRandomAvatarPath(),
          username,
        },
      });
      return created as AdapterUser;
    },
  },
  session: { strategy: "jwt" },
  providers: [
    Google,
    Kakao({
      // 카카오는 이메일 권한이 비즈니스 앱 인증 없이는 불가 — Kakao ID로 가상 이메일 생성
      profile(profile) {
        return {
          id: String(profile.id),
          name:
            profile.kakao_account?.profile?.nickname ??
            profile.properties?.nickname ??
            "카카오 사용자",
          email:
            profile.kakao_account?.email ??
            `kakao_${profile.id}@kakao.placeholder`,
          image:
            profile.kakao_account?.profile?.profile_image_url ??
            profile.properties?.profile_image ??
            null,
        };
      },
    }),
    // E2E 테스트 전용 — Google OAuth 없이 이메일로 직접 로그인
    ...(process.env.E2E === 'true' ? [
      Credentials({
        credentials: { email: {} },
        async authorize(credentials) {
          const email = credentials?.email as string | undefined;
          if (!email) return null;
          return await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, image: true },
          });
        },
      }),
    ] : []),
  ],
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
