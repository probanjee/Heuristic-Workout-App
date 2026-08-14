import crypto from "node:crypto";
import { promisify } from "node:util";
import {
  consumeAuthChallenge,
  createAuthChallenge,
  createLocalUser,
  getLatestActiveChallenge,
  getUserByEmail,
  getUserByPhone,
  incrementAuthChallengeAttempts,
  invalidateAuthChallenge,
  markUserEmailVerified,
  markUserPhoneVerified,
  updateUserPassword,
  upsertUserProfile,
} from "../db";
import { getEmailProvider, getOtpProvider } from "./providers";

const scrypt = promisify(crypto.scrypt);
const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_WINDOW_MS = 60 * 1000;
const MAX_CHALLENGE_ATTEMPTS = 5;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.trim().replace(/[\s()-]/g, "");
}

function assertValidPhone(phone: string) {
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new Error(
      "Enter a valid mobile number with the country code, for example +14155552671."
    );
  }
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [salt, storedHex] = encodedHash.split(":");
  if (!salt || !storedHex) return false;
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const stored = Buffer.from(storedHex, "hex");
  return (
    stored.length === derivedKey.length &&
    crypto.timingSafeEqual(stored, derivedKey)
  );
}

function createChallengeCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashChallenge(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

async function assertResendAllowed(
  identifier: string,
  purpose: "phone_login" | "email_verification" | "password_reset"
) {
  const active = await getLatestActiveChallenge(identifier, purpose);
  if (active && Date.now() - active.sentAt.getTime() < OTP_RESEND_WINDOW_MS) {
    throw new Error("Please wait before requesting another verification code");
  }
}

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  birthDate: string;
  deliveryMethod: "email" | "phone";
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const normalizedPhone = normalizePhone(input.phone);
  assertValidPhone(normalizedPhone);
  if (input.password.length < 8)
    throw new Error("Password must be at least 8 characters");
  if (await getUserByEmail(normalizedEmail))
    throw new Error("An account with this email already exists");
  if (await getUserByPhone(normalizedPhone))
    throw new Error("An account with this phone number already exists");
  const birthDate = new Date(input.birthDate);
  if (Number.isNaN(birthDate.getTime()) || birthDate >= new Date())
    throw new Error("Birthdate must be a valid date in the past");
  const user = await createLocalUser({
    name: input.fullName.trim(),
    email: normalizedEmail,
    phoneNumber: normalizedPhone,
    passwordHash: await hashPassword(input.password),
    loginMethod: "email",
  });
  await upsertUserProfile(user.id, {
    onboardingStep: 0,
    onboardingCompleted: 0,
    birthDate,
  });
  if (input.deliveryMethod === "email")
    await requestEmailVerification(normalizedEmail, user.id);
  else await requestPhoneOtp(normalizedPhone);
  return user;
}

export async function signInWithEmail(email: string, password: string) {
  const user = await getUserByEmail(normalizeEmail(email));
  if (
    !user?.passwordHash ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    throw new Error("Invalid email or password");
  }
  return user;
}

export async function requestEmailVerification(email: string, userId?: number) {
  const normalizedEmail = normalizeEmail(email);
  await assertResendAllowed(normalizedEmail, "email_verification");
  const code = createChallengeCode();
  await createAuthChallenge({
    userId: userId ?? null,
    identifier: normalizedEmail,
    channel: "email",
    purpose: "email_verification",
    challengeHash: hashChallenge(code),
    expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
  });
  await getEmailProvider().send({
    to: normalizedEmail,
    subject: "Verify your Adaptive Fitness account",
    html: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
  });
}

export async function verifyEmailCode(email: string, code: string) {
  const normalizedEmail = normalizeEmail(email);
  const challenge = await getLatestActiveChallenge(
    normalizedEmail,
    "email_verification"
  );
  if (!challenge || challenge.attemptCount >= MAX_CHALLENGE_ATTEMPTS)
    throw new Error("Verification code is invalid or expired");
  if (hashChallenge(code) !== challenge.challengeHash) {
    await incrementAuthChallengeAttempts(challenge.id);
    throw new Error("Verification code is invalid or expired");
  }
  await consumeAuthChallenge(challenge.id);
  const user = await getUserByEmail(normalizedEmail);
  if (!user) throw new Error("Email account not found");
  await markUserEmailVerified(user.id);
  return getUserByEmail(normalizedEmail);
}

export async function requestPhoneOtp(phone: string) {
  const normalizedPhone = normalizePhone(phone);
  assertValidPhone(normalizedPhone);
  await assertResendAllowed(normalizedPhone, "phone_login");
  const existing = await getUserByPhone(normalizedPhone);
  const user =
    existing ??
    (await createLocalUser({
      phoneNumber: normalizedPhone,
      loginMethod: "phone",
    }));
  const code = createChallengeCode();
  await createAuthChallenge({
    userId: user.id,
    identifier: normalizedPhone,
    channel: "phone",
    purpose: "phone_login",
    challengeHash: hashChallenge(code),
    expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
  });
  const challenge = await getLatestActiveChallenge(
    normalizedPhone,
    "phone_login"
  );
  try {
    await getOtpProvider().send({
      to: normalizedPhone,
      code,
      expiresInMinutes: 10,
    });
  } catch (error) {
    if (challenge) await invalidateAuthChallenge(challenge.id);
    throw error;
  }
  return { userId: user.id };
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await getUserByEmail(normalizedEmail);
  if (!user) return;
  await assertResendAllowed(normalizedEmail, "password_reset");
  const code = createChallengeCode();
  await createAuthChallenge({
    userId: user.id,
    identifier: normalizedEmail,
    channel: "email",
    purpose: "password_reset",
    challengeHash: hashChallenge(code),
    expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
  });
  await getEmailProvider().send({
    to: normalizedEmail,
    subject: "Reset your Adaptive Fitness password",
    html: `<p>Your password reset code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
  });
}

export async function resetPassword(
  email: string,
  code: string,
  password: string
) {
  if (password.length < 8)
    throw new Error("Password must be at least 8 characters");
  const normalizedEmail = normalizeEmail(email);
  const challenge = await getLatestActiveChallenge(
    normalizedEmail,
    "password_reset"
  );
  if (!challenge || challenge.attemptCount >= MAX_CHALLENGE_ATTEMPTS)
    throw new Error("Password reset code is invalid or expired");
  if (hashChallenge(code) !== challenge.challengeHash) {
    await incrementAuthChallengeAttempts(challenge.id);
    throw new Error("Password reset code is invalid or expired");
  }
  const user = await getUserByEmail(normalizedEmail);
  if (!user) throw new Error("Password reset code is invalid or expired");
  await consumeAuthChallenge(challenge.id);
  await updateUserPassword(user.id, await hashPassword(password));
  return getUserByEmail(normalizedEmail);
}

export async function verifyPhoneOtp(phone: string, code: string) {
  const normalizedPhone = normalizePhone(phone);
  const challenge = await getLatestActiveChallenge(
    normalizedPhone,
    "phone_login"
  );
  if (!challenge || challenge.attemptCount >= MAX_CHALLENGE_ATTEMPTS)
    throw new Error("Verification code is invalid or expired");
  if (hashChallenge(code) !== challenge.challengeHash) {
    await incrementAuthChallengeAttempts(challenge.id);
    throw new Error("Verification code is invalid or expired");
  }
  await consumeAuthChallenge(challenge.id);
  const user = await getUserByPhone(normalizedPhone);
  if (!user) throw new Error("Phone account not found");
  await markUserPhoneVerified(user.id);
  return user;
}
