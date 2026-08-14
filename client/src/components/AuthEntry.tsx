import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  isValidEmail,
  isValidInternationalPhone,
  isValidOtp,
  isValidPassword,
} from "@/lib/authValidation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type AuthMode = "email" | "phone";

export default function AuthEntry() {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<AuthMode>("email");
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneResendSeconds, setPhoneResendSeconds] = useState(0);
  const [phoneRetryReady, setPhoneRetryReady] = useState(false);

  useEffect(() => {
    if (phoneResendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setPhoneResendSeconds(seconds => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phoneResendSeconds]);

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (isSignup && fullName.trim().length < 2) {
      toast.error("Enter your full name.");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (!isValidPassword(password)) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });
        if (error) {
          console.error("Supabase signUp error:", error);
          throw error;
        }
        console.log("Supabase signUp response:", { data });
        if (data.session) {
          toast.success("Account created and signed in successfully!");
        } else if (
          data.user &&
          (!data.user.identities || data.user.identities.length === 0)
        ) {
          toast.error(
            "An account with this email already exists. Please sign in."
          );
        } else {
          toast.success(
            "Account created! Please check your email for a verification link."
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) {
          console.error("Supabase signInWithPassword error:", error);
          throw error;
        }
        console.log("Supabase signInWithPassword success:", data);
        toast.success("Signed in successfully.");
      }
    } catch (error: any) {
      const msg = error?.message ?? "Authentication failed. Try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValidInternationalPhone(phone)) {
      toast.error(
        "Use an international phone format, for example +14155552671."
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        console.error("Supabase signInWithOtp error:", error);
        throw error;
      }
      setOtpRequested(true);
      setPhoneResendSeconds(60);
      setPhoneRetryReady(false);
      toast.success("Verification code sent to your phone.");
    } catch (error: any) {
      setPhoneRetryReady(true);
      toast.error(
        error?.message ?? "We could not send the code. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValidOtp(otp)) {
      toast.error("Enter the 6-digit verification code.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });
      if (error) {
        console.error("Supabase verifyOtp error:", error);
        throw error;
      }
      toast.success("Phone verified. Welcome to Adaptive Fitness.");
    } catch (error: any) {
      toast.error(error?.message ?? "Verification failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      console.error("Supabase Google OAuth error:", error);
      toast.error(error.message ?? "Google sign-in failed.");
    }
  };

  const switchMode = (nextSignup: boolean) => {
    setIsSignup(nextSignup);
    setMode("email");
    setOtpRequested(false);
    setOtp("");
    setPhoneResendSeconds(0);
    setPhoneRetryReady(false);
  };

  return (
    <div className="auth-scene relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div
        className="auth-orbit pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <motion.div
          className="auth-orb auth-orb-lime absolute -left-24 top-12 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="auth-orb auth-orb-cyan absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-cyan-300/12 blur-3xl"
          animate={
            reduceMotion ? undefined : { x: [0, -25, 0], y: [0, -15, 0] }
          }
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          className="hidden space-y-6 lg:block"
          initial={reduceMotion ? undefined : { opacity: 0, x: -24 }}
          animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_16px_var(--primary)]" />
            Your training starts here
          </div>
          <h1 className="max-w-md text-5xl font-semibold tracking-tight text-white">
            Train with a plan that learns from you.
          </h1>
          <p className="max-w-md text-base leading-7 text-muted-foreground">
            Create your account, choose how to verify it, and get a plan built
            around the way you actually train.
          </p>
          <div className="grid max-w-md gap-3 sm:grid-cols-3">
            <TrustItem
              icon={ShieldCheck}
              label="Secure"
              detail="Protected access"
            />
            <TrustItem
              icon={LockKeyhole}
              label="Private"
              detail="Your data stays yours"
            />
            <TrustItem
              icon={MessageSquareText}
              label="Guided"
              detail="Human-readable logic"
            />
          </div>
        </motion.div>

        <motion.div
          className="auth-glass-card mx-auto w-full max-w-md rounded-[28px] border border-white/[0.22] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8"
          initial={
            reduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.98 }
          }
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="mb-7 space-y-2">
            {isSignup ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Start your baseline
              </p>
            ) : null}
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {isSignup ? "Create your account" : "Sign in to your workspace"}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {isSignup
                ? "Add your details and we'll get you started."
                : "Continue with Google, email, or a phone verification code."}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={signInWithGoogle}
            className="h-11 w-full border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
          >
            <GoogleMark /> Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px flex-1 bg-white/10" /> or use another method{" "}
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {(["email", "phone"] as const).map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${mode === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"}`}
              >
                {item === "email" ? "Email" : "Phone + OTP"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {mode === "email" ? (
              <motion.form
                key="email"
                onSubmit={submitEmail}
                className="space-y-4"
                initial={reduceMotion ? undefined : { opacity: 0, x: 10 }}
                animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {isSignup ? (
                  <Field label="Full name" htmlFor="auth-full-name">
                    <Input
                      id="auth-full-name"
                      autoComplete="name"
                      value={fullName}
                      onChange={event => setFullName(event.target.value)}
                      placeholder="Your full name"
                      className="auth-input"
                    />
                  </Field>
                ) : null}

                <Field label="Email address" htmlFor="auth-email">
                  <Input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="auth-input"
                  />
                </Field>
                <Field
                  label="Password"
                  htmlFor="auth-password"
                  action={
                    <button
                      type="button"
                      onClick={() => setShowPassword(visible => !visible)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  }
                >
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    className="auth-input"
                  />
                </Field>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {isSignup ? "Create account" : "Sign in with email"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  {isSignup
                    ? "Already have an account?"
                    : "New to Adaptive Fitness?"}{" "}
                  <button
                    type="button"
                    onClick={() => switchMode(!isSignup)}
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    {isSignup ? "Sign in" : "Create an account"}
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="phone"
                className="space-y-4"
                initial={reduceMotion ? undefined : { opacity: 0, x: 10 }}
                animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={requestOtp} className="space-y-4">
                  <Field label="Phone number" htmlFor="auth-phone">
                    <Input
                      id="auth-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={event => setPhone(event.target.value)}
                      placeholder="+1 415 555 2671"
                      className="auth-input"
                    />
                  </Field>
                  <Button
                    type="submit"
                    disabled={isSubmitting || phoneResendSeconds > 0}
                    className="h-11 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    {phoneResendSeconds > 0
                      ? `Try again in ${phoneResendSeconds}s`
                      : phoneRetryReady
                        ? "Try again"
                        : otpRequested
                          ? "Resend code"
                          : "Send verification code"}
                  </Button>
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-center text-xs text-muted-foreground"
                  >
                    {phoneResendSeconds > 0
                      ? "A new code can be requested when the timer ends."
                      : phoneRetryReady
                        ? "The previous attempt did not go through. Check the number and try again."
                        : otpRequested
                          ? "You can request another code now."
                          : "We will send a 6-digit code to your phone."}
                  </p>
                </form>
                {otpRequested ? (
                  <form
                    onSubmit={verifyOtp}
                    className="space-y-4 border-t border-white/10 pt-4"
                  >
                    <Field
                      label="6-digit verification code"
                      htmlFor="auth-otp"
                    >
                      <Input
                        id="auth-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otp}
                        onChange={event =>
                          setOtp(
                            event.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        placeholder="000000"
                        className="auth-input"
                      />
                    </Field>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      variant="outline"
                      className="h-11 w-full border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                    >
                      Verify and continue
                    </Button>
                  </form>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <p className="pointer-events-none absolute bottom-5 right-6 hidden text-right font-mono text-[8px] font-medium tracking-[0.12em] text-white/35 lg:block">
        created and maintained by &lt;probanjee&gt;
      </p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  action,
  children,
}: {
  label: string;
  htmlFor: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-white">
          {label}
        </Label>
        {action}
      </div>
      {children}
    </div>
  );
}

function TrustItem({
  icon: Icon,
  label,
  detail,
}: {
  icon: typeof ShieldCheck;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 text-xs font-semibold text-white">{label}</p>
      <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <span
      aria-hidden="true"
      className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-bold text-[#4285f4]"
    >
      G
    </span>
  );
}
