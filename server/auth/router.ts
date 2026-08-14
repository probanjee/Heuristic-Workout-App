import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  requestEmailVerification,
  requestPasswordReset,
  requestPhoneOtp,
  signInWithEmail,
  resetPassword,
  signUpWithEmail,
  verifyEmailCode,
  verifyPhoneOtp,
} from "./service";

type SessionSetter = (
  ctx: { req: any; res: any },
  user: { openId: string; name: string | null }
) => Promise<{ success: true }>;

function authFailure(error: unknown): never {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message:
      error instanceof Error ? error.message : "Authentication request failed",
  });
}

export function authEmail(setSessionCookie: SessionSetter) {
  return router({
    signUp: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8).max(128),
          fullName: z.string().trim().min(2).max(120),
          phone: z.string().regex(/^\+[1-9]\d{7,14}$/),
          birthDate: z.string().date(),
          deliveryMethod: z.enum(["email", "phone"]),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await signUpWithEmail(input);
          return {
            success: true,
            verificationChannel: input.deliveryMethod,
          } as const;
        } catch (error) {
          return authFailure(error);
        }
      }),
    signIn: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8).max(128),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const user = await signInWithEmail(input.email, input.password);
          await setSessionCookie(ctx, user);
          return { success: true } as const;
        } catch (error) {
          return authFailure(error);
        }
      }),
    verify: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          code: z.string().regex(/^\d{6}$/),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const user = await verifyEmailCode(input.email, input.code);
          if (!user) throw new Error("Email verification failed");
          await setSessionCookie(ctx, user);
          return { success: true } as const;
        } catch (error) {
          return authFailure(error);
        }
      }),
    resendVerification: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        try {
          await requestEmailVerification(input.email);
          return { success: true } as const;
        } catch (error) {
          return authFailure(error);
        }
      }),
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        try {
          await requestPasswordReset(input.email);
          return { success: true } as const;
        } catch (error) {
          return authFailure(error);
        }
      }),
    resetPassword: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          code: z.string().regex(/^\d{6}$/),
          password: z.string().min(8).max(128),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await resetPassword(input.email, input.code, input.password);
          return { success: true } as const;
        } catch (error) {
          return authFailure(error);
        }
      }),
  });
}

export function authPhone(setSessionCookie: SessionSetter) {
  return router({
    requestOtp: publicProcedure
      .input(z.object({ phone: z.string().regex(/^\+[1-9]\d{7,14}$/) }))
      .mutation(async ({ input }) => {
        try {
          await requestPhoneOtp(input.phone);
          return { success: true } as const;
        } catch (error) {
          return authFailure(error);
        }
      }),
    verifyOtp: publicProcedure
      .input(
        z.object({
          phone: z.string().regex(/^\+[1-9]\d{7,14}$/),
          code: z.string().regex(/^\d{6}$/),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const user = await verifyPhoneOtp(input.phone, input.code);
          await setSessionCookie(ctx, user);
          return { success: true } as const;
        } catch (error) {
          return authFailure(error);
        }
      }),
  });
}
