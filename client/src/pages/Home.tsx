import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleDot,
  Clock3,
  Dumbbell,
  Flame,
  HeartPulse,
  Info,
  Play,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const navigationCards = [
  { label: "Workout history", href: "/history", icon: CalendarDays },
  { label: "Progress analytics", href: "/progress", icon: TrendingUp },
  { label: "Exercise library", href: "/exercises", icon: Dumbbell },
];

const MOTIVATION_QUOTES = {
  balanced: [
    "Small sessions become strong habits.",
    "Show up with intention; leave with momentum.",
    "Your next set is the only thing you need to solve.",
    "Progress is built one honest effort at a time.",
  ],
  focus: [
    "Control the rep you are in.",
    "A clear target makes the next set simpler.",
    "Quality work starts before the first rep.",
    "Keep the plan simple and the effort honest.",
  ],
  recovery: [
    "Recovery is part of the work, not time away from it.",
    "A smart session leaves room for the next one.",
    "Listen closely; consistency includes adjusting well.",
    "Rest with purpose, then return with intent.",
  ],
  encouragement: [
    "You do not need a perfect session to move forward.",
    "One completed set is still a vote for your future self.",
    "Keep going at a pace you can repeat.",
    "The work you can sustain is the work that changes you.",
  ],
} as const;

type QuotePreference = keyof typeof MOTIVATION_QUOTES;

export default function Home() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Athlete";
  const recommendation = trpc.recommendation.today.useQuery();
  const profile = trpc.profile.get.useQuery();
  const plan = recommendation.data;
  const isReady = plan?.status === "ready";

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-8 px-2 pb-12 sm:px-4 lg:px-8">
      <header className="flex flex-col justify-between gap-5 pt-2 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_16px_var(--primary)]" />
            Your training today
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Good to see you, {firstName}.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            A clear plan for today, shaped around your goals, time, and recent
            training. Start here, then let your performance guide what comes
            next.
          </p>
        </div>
        <Button
          asChild
          className="h-11 w-full gap-2 bg-primary px-5 font-semibold text-primary-foreground shadow-[0_12px_36px_-14px_var(--primary)] transition-transform hover:-translate-y-0.5 sm:w-auto"
        >
          <Link href="/workout">
            <Play className="h-4 w-4 fill-current" /> Start workout
          </Link>
        </Button>
      </header>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
        <Card className="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_85%_15%,rgba(191,255,0,0.16),transparent_34%),linear-gradient(135deg,#1c211b,#111412)] shadow-2xl shadow-black/20">
          <CardContent className="relative p-6 sm:p-8">
            <div className="absolute right-8 top-8 hidden h-36 w-36 rounded-full border border-primary/20 sm:block" />
            <div className="absolute right-14 top-14 hidden h-24 w-24 rounded-full border border-primary/15 sm:block" />
            <div className="relative max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/10">
                  {isReady ? "TODAY’S RECOMMENDATION" : "PROFILE SIGNAL NEEDED"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {recommendation.isLoading
                    ? "Preparing your plan"
                    : isReady
                      ? "Ready for today"
                      : "Profile details needed"}
                </span>
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                {isReady ? plan.title : "Build your adaptive baseline."}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-white/65">
                {isReady
                  ? plan.summary
                  : "Complete your profile to unlock a workout shaped around your goal, available time, equipment, recovery, and recent performance."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Link href={isReady ? "/workout" : "/onboarding"}>
                    {isReady ? "Start today’s session" : "Set up my plan"}{" "}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  <Link href="/recommendations">How it works</Link>
                </Button>
              </div>
              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 border-t border-white/10 pt-5">
                <Metric
                  label="Duration"
                  value={isReady ? `${plan.durationMinutes}m` : "—"}
                  detail={isReady ? "planned duration" : "profile needed"}
                  icon={Clock3}
                />
                <Metric
                  label="Exercises"
                  value={isReady ? `${plan.exerciseCount}` : "—"}
                  detail={isReady ? "planned exercises" : "profile needed"}
                  icon={Dumbbell}
                />
                <Metric
                  label="Goal fit"
                  value={isReady ? plan.goalFit : "—"}
                  detail={isReady ? "goal alignment" : "profile needed"}
                  icon={Target}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/75 backdrop-blur-md">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Consistency
              </p>
              <CardTitle className="mt-2 text-2xl text-white">
                Your rhythm
              </CardTitle>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Flame className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-5xl font-semibold tracking-tight text-white">
                  —
                </span>
                <span className="ml-2 text-sm text-muted-foreground">
                  active streak
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                No sessions yet
              </span>
            </div>
            <Progress
              value={0}
              className="mt-6 h-2 bg-white/10 [&>div]:bg-primary"
            />
            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              <span>Weekly completion</span>
              <span>Awaiting your first workout</span>
            </div>
            <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-5 text-muted-foreground">
                  Consistency is calculated from completed sessions, not planned
                  sessions. Your streak will reflect what you actually do.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <MotivationQuote
          preference={
            (profile.data?.quotePreference as QuotePreference | null) ??
            "balanced"
          }
        />
        <Card className="border-white/10 bg-card/75 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Performance cockpit
              </p>
              <CardTitle className="mt-2 text-2xl text-white">
                Start with a clean signal
              </CardTitle>
            </div>
            <HeartPulse className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <PerformanceTile label="Total workouts" value="—" />
              <PerformanceTile label="Training time" value="—" />
              <PerformanceTile label="Personal records" value="—" />
            </div>
            <div className="mt-5 flex min-h-36 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
              <div>
                <CircleDot className="mx-auto h-6 w-6 text-primary/70" />
                <p className="mt-3 text-sm font-medium text-white">
                  Your performance graph will appear here.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Log your first session to establish your baseline.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/75 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                Why this workout
              </p>
            </div>
            <CardTitle className="mt-2 text-2xl text-white">
              Why this plan?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              Each workout is shaped by your goal, available time, recovery,
              equipment, fatigue, and recent progress—so the plan stays
              practical instead of generic.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ReasonChip>GOAL_ALIGNMENT</ReasonChip>
              <ReasonChip>MUSCLE_RECOVERY</ReasonChip>
              <ReasonChip>TIME_CONSTRAINT</ReasonChip>
            </div>
            <Button
              asChild
              variant="ghost"
              className="mt-5 h-auto px-0 text-primary hover:bg-transparent hover:text-primary/80"
            >
              <Link href="/recommendations">
                See why this plan <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Your workspace
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Keep moving forward
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            More modules unlock as data accumulates
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {navigationCards.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-card/50 p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.05]"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-white">
                <span className="rounded-lg bg-white/5 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function MotivationQuote({ preference }: { preference: QuotePreference }) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [visible, setVisible] = useState(0);
  const quotes = MOTIVATION_QUOTES[preference];
  const quote = quotes[quoteIndex % quotes.length];

  useEffect(() => {
    setVisible(0);
    const typing = window.setInterval(() => {
      setVisible(current => {
        if (current >= quote.length) {
          window.clearInterval(typing);
          return current;
        }
        return current + 1;
      });
    }, 34);
    const rotation = window.setTimeout(() => {
      setQuoteIndex(current => (current + 1) % quotes.length);
    }, 5000);
    return () => {
      window.clearInterval(typing);
      window.clearTimeout(rotation);
    };
  }, [quote, quotes.length]);

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-primary/[0.06] backdrop-blur-md lg:col-span-2">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <CardContent className="relative flex min-h-24 items-center gap-3 p-5 sm:p-6">
        <Sparkles className="h-5 w-5 shrink-0 text-primary" />
        <p
          className="text-base font-medium text-white sm:text-lg"
          aria-live="polite"
        >
          {quote.slice(0, visible)}
          <span
            className="ml-0.5 inline-block h-5 w-px animate-pulse bg-primary align-middle"
            aria-hidden="true"
          />
        </p>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Clock3;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-white/50">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
      <div className="text-[11px] text-white/40">{detail}</div>
    </div>
  );
}

function PerformanceTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
function ReasonChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-primary">
      {children}
    </span>
  );
}
