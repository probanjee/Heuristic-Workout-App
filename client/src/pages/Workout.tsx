import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Info,
  Pause,
  Play,
  RotateCcw,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type Session = NonNullable<
  ReturnType<typeof trpc.workout.start.useMutation>["data"]
> & {
  status: "started";
  workout?: {
    id: number;
    exercises?: Array<{ id: number; slug: string; sets: number }>;
  };
};

function AnimatedExerciseGuide({
  movementPattern,
  name,
  steps,
  tutorialMedia,
}: {
  movementPattern: string;
  name: string;
  steps: string[];
  tutorialMedia?: {
    src: string;
    sourceUrl: string;
    attribution: string;
    license: string;
  };
}) {
  const [mediaFailed, setMediaFailed] = useState(false);
  const showMedia = Boolean(tutorialMedia && !mediaFailed);

  return (
    <aside className="exercise-guide" aria-label={`${name} movement guide`}>
      {showMedia && tutorialMedia ? (
        <figure className="exercise-guide-media">
          <img
            src={tutorialMedia.src}
            alt={`${name} exercise demonstration`}
            loading="lazy"
            onError={() => setMediaFailed(true)}
          />
          <figcaption>
            <a
              href={tutorialMedia.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-primary/50 underline-offset-2"
            >
              {tutorialMedia.attribution}
            </a>
            <span aria-hidden="true"> · </span>
            {tutorialMedia.license}
          </figcaption>
        </figure>
      ) : (
        <div
          className={`exercise-guide-figure exercise-guide-${movementPattern}`}
          aria-hidden="true"
        >
          <span className="exercise-guide-motion-label">
            {movementPattern === "horizontal_push"
              ? "lower · press"
              : movementPattern === "carry"
                ? "hold · breathe"
                : "down · drive"}
          </span>
          <span className="exercise-guide-head" />
          <span className="exercise-guide-torso" />
          <span className="exercise-guide-arm exercise-guide-arm-left" />
          <span className="exercise-guide-arm exercise-guide-arm-right" />
          <span className="exercise-guide-leg exercise-guide-leg-left" />
          <span className="exercise-guide-leg exercise-guide-leg-right" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Form guide
        </p>
        <ol className="mt-2 space-y-1 text-xs leading-relaxed text-white/70">
          {steps.map((step, index) => (
            <li key={step}>
              <span className="mr-1 font-mono text-primary">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}

export default function Workout() {
  const workout = trpc.workout.today.useQuery();
  const plan = workout.data;
  const [session, setSession] = useState<Session | null>(null);
  const [loggedSets, setLoggedSets] = useState<Record<string, number>>({});
  const [reps, setReps] = useState<Record<string, string>>({});
  const [load, setLoad] = useState<Record<string, string>>({});
  const [rpe, setRpe] = useState<Record<string, string>>({});
  const [energy, setEnergy] = useState("4");
  const [difficulty, setDifficulty] = useState("3");
  const [notes, setNotes] = useState("");
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [exerciseTimers, setExerciseTimers] = useState<Record<string, number>>(
    {}
  );
  const [activeExerciseTimer, setActiveExerciseTimer] = useState<string | null>(
    null
  );
  const start = trpc.workout.start.useMutation();
  const logSet = trpc.workout.logSet.useMutation();
  const complete = trpc.workout.complete.useMutation();

  const sessionWorkout = session?.workout;
  const completedExercises =
    plan?.exercises.filter(
      exercise => (loggedSets[exercise.slug] ?? 0) >= exercise.sets
    ).length ?? 0;
  const completionPercent = plan?.exercises.length
    ? Math.round((completedExercises / plan.exercises.length) * 100)
    : 0;

  useEffect(() => {
    if (!sessionStartedAt || timerPaused || complete.isSuccess) return;
    const tick = window.setInterval(() => {
      setElapsedSeconds(current => current + 1);
    }, 1000);
    return () => window.clearInterval(tick);
  }, [complete.isSuccess, sessionStartedAt, timerPaused]);

  useEffect(() => {
    if (!activeExerciseTimer) return;
    const timer = window.setInterval(() => {
      setExerciseTimers(current => {
        const nextValue = Math.max(0, (current[activeExerciseTimer] ?? 0) - 1);
        if (nextValue === 0) setActiveExerciseTimer(null);
        return { ...current, [activeExerciseTimer]: nextValue };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeExerciseTimer]);

  useEffect(() => {
    if (!sessionWorkout) return;
    const storageKey = `adaptive-workout-timer:${sessionWorkout.id}`;
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as {
        elapsedSeconds?: number;
        paused?: boolean;
      };
      if (typeof parsed.elapsedSeconds === "number") {
        setElapsedSeconds(parsed.elapsedSeconds);
      }
      if (parsed.paused) {
        setTimerPaused(true);
        setSessionStartedAt(null);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [sessionWorkout]);

  useEffect(() => {
    if (!sessionWorkout || complete.isSuccess) return;
    window.localStorage.setItem(
      `adaptive-workout-timer:${sessionWorkout.id}`,
      JSON.stringify({ elapsedSeconds, paused: timerPaused })
    );
  }, [complete.isSuccess, elapsedSeconds, sessionWorkout, timerPaused]);

  const formattedElapsed = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
  const sessionExercises = sessionWorkout?.exercises ?? [];
  const allSetsLogged = useMemo(
    () =>
      Boolean(
        plan?.status === "ready" &&
          plan.exercises.length > 0 &&
          plan.exercises.every(
            exercise => (loggedSets[exercise.slug] ?? 0) >= exercise.sets
          )
      ),
    [loggedSets, plan]
  );

  if (workout.isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-muted-foreground">
        Building today’s session…
      </div>
    );
  }

  if (!plan || plan.status === "profile_needed") {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
        <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
        <Card className="border-white/10 bg-card/80">
          <CardContent className="space-y-4 p-8">
            <Badge className="bg-primary/10 text-primary">
              PROFILE SIGNAL NEEDED
            </Badge>
            <h1 className="text-3xl font-semibold text-white">
              Build your first adaptive session.
            </h1>
            <p className="max-w-xl leading-6 text-muted-foreground">
              Complete onboarding so your session can match your goal, time,
              equipment, and recovery state.
            </p>
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/onboarding">Complete onboarding</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startSession = () => {
    start.mutate(undefined, {
      onSuccess: result => {
        if (result.status === "started") {
          setSession(result as Session);
          setSessionStartedAt(Date.now());
          setElapsedSeconds(0);
          setTimerPaused(false);
        }
      },
    });
  };

  const handleLogSet = (
    slug: string,
    exercise: (typeof plan.exercises)[number]
  ) => {
    const persisted = sessionExercises.find(item => item.slug === slug);
    if (!sessionWorkout || !persisted) return;
    const setNumber = (loggedSets[slug] ?? 0) + 1;
    logSet.mutate(
      {
        workoutId: sessionWorkout.id,
        workoutExerciseId: persisted.id,
        setNumber,
        targetReps: exercise.reps,
        actualReps:
          exercise.mode === "timed"
            ? (exercise.targetSeconds ?? 0)
            : Number(reps[slug] || exercise.reps.replace(/[^0-9].*$/, "")) || 0,
        loadKg: load[slug] ? Number(load[slug]) : undefined,
        perceivedExertion: rpe[slug] ? Number(rpe[slug]) : undefined,
      },
      {
        onSuccess: () =>
          setLoggedSets(current => ({ ...current, [slug]: setNumber })),
      }
    );
  };

  const toggleExerciseTimer = (slug: string, seconds: number) => {
    if (activeExerciseTimer === slug) {
      setActiveExerciseTimer(null);
      return;
    }
    setExerciseTimers(current => ({
      ...current,
      [slug]: current[slug] > 0 ? current[slug] : seconds,
    }));
    setActiveExerciseTimer(slug);
  };

  const resetExerciseTimer = (slug: string, seconds: number) => {
    setActiveExerciseTimer(current => (current === slug ? null : current));
    setExerciseTimers(current => ({ ...current, [slug]: seconds }));
  };

  const toggleTimer = () => {
    if (!sessionWorkout || complete.isSuccess) return;
    if (timerPaused) {
      setTimerPaused(false);
      setSessionStartedAt(Date.now());
      return;
    }
    setTimerPaused(true);
    setSessionStartedAt(null);
  };

  const finishSession = () => {
    if (!sessionWorkout) return;
    complete.mutate({
      workoutId: sessionWorkout.id,
      energy: Number(energy),
      difficulty: Number(difficulty),
      notes: notes || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pb-12 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </Button>
        {!session && (
          <Button
            onClick={startSession}
            disabled={start.isPending}
            className="gap-2 bg-primary text-primary-foreground"
          >
            <Play className="h-4 w-4 fill-current" />{" "}
            {start.isPending ? "Preparing…" : "Start session"}
          </Button>
        )}
        {session && !complete.isSuccess && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={toggleTimer}
              className="gap-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
              aria-label={timerPaused ? "Resume timer" : "Pause timer"}
            >
              {timerPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
              {timerPaused ? "Resume" : "Pause"}
            </Button>
            <Badge className="border-primary/30 bg-primary/10 px-3 py-1.5 text-primary">
              {timerPaused ? "SESSION PAUSED" : "SESSION IN PROGRESS"}
            </Badge>
          </div>
        )}
      </div>
      <header className="space-y-3">
        <Badge className="bg-primary/10 text-primary">TODAY’S SESSION</Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          {plan.title}
        </h1>
        <p className="text-muted-foreground">
          A {plan.durationMinutes}-minute session shaped around your current
          goals and recovery.
        </p>
        <div className="flex flex-wrap gap-2">
          {plan.reasonCodes.map(reason => (
            <Badge
              key={reason}
              variant="outline"
              className="border-white/15 text-white/75"
            >
              {reason}
            </Badge>
          ))}
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-primary/20 bg-primary/[0.06] sm:col-span-2">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Session progress
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {completedExercises}/{plan.exercises.length}
              </p>
            </div>
            <div
              className="relative grid h-16 w-16 place-items-center rounded-full border-4 border-white/10"
              aria-label={`${completionPercent}% complete`}
            >
              <div
                className="absolute inset-0 rounded-full border-4 border-primary transition-[clip-path] duration-700"
                style={{ clipPath: `inset(${100 - completionPercent}% 0 0 0)` }}
              />
              <span className="relative text-sm font-semibold text-primary">
                {completionPercent}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Metric
          label={timerPaused ? "Paused" : "Timer"}
          value={session ? formattedElapsed : "00:00"}
          icon={Clock3}
        />
        <Metric
          label="Duration"
          value={`${plan.durationMinutes}m`}
          icon={Clock3}
        />
        <Metric
          label="Exercises"
          value={`${plan.exercises.length}`}
          icon={Dumbbell}
        />
        <Metric
          label="Status"
          value={
            complete.isSuccess ? "Completed" : session ? "In progress" : "Ready"
          }
          icon={CheckCircle2}
        />
      </div>
      <Card className="border-white/10 bg-card/70 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Session sequence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.exercises.map(exercise => {
            const count = loggedSets[exercise.slug] ?? 0;
            const persisted = sessionExercises.find(
              item => item.slug === exercise.slug
            );
            return (
              <div
                key={exercise.slug}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-primary">
                        {String(exercise.position).padStart(2, "0")} ·{" "}
                        {exercise.primaryMuscle}
                      </p>
                      <h2 className="mt-1 font-semibold text-white">
                        {exercise.name}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {exercise.instructions}
                      </p>
                    </div>
                  </div>
                  <AnimatedExerciseGuide
                    movementPattern={exercise.movementPattern}
                    name={exercise.name}
                    steps={exercise.tutorialSteps}
                    tutorialMedia={exercise.tutorialMedia}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/75">
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary"
                  >
                    {exercise.mode === "timed"
                      ? `${exercise.targetSeconds ?? 0}s timer`
                      : `${exercise.reps} reps`}
                  </Badge>
                  <span>{exercise.sets} sets</span>
                  <span>{exercise.restSeconds}s rest</span>
                </div>
                {session && persisted && !complete.isSuccess && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-end">
                    {exercise.mode === "timed" ? (
                      <div className="flex-1 rounded-lg border border-primary/20 bg-primary/[0.06] p-3 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between gap-3">
                          <span>
                            Set {Math.min(count + 1, exercise.sets)} duration
                          </span>
                          <strong className="font-mono text-lg text-primary">
                            {String(
                              exerciseTimers[exercise.slug] ??
                                exercise.targetSeconds ??
                                0
                            ).padStart(2, "0")}
                            s
                          </strong>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              toggleExerciseTimer(
                                exercise.slug,
                                exercise.targetSeconds ?? 0
                              )
                            }
                            className="gap-2 bg-primary text-primary-foreground"
                          >
                            {activeExerciseTimer === exercise.slug ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                            {activeExerciseTimer === exercise.slug
                              ? "Pause timer"
                              : "Start timer"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              resetExerciseTimer(
                                exercise.slug,
                                exercise.targetSeconds ?? 0
                              )
                            }
                            className="gap-2 border-white/10"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex-1 text-xs text-muted-foreground">
                        Actual reps for set {Math.min(count + 1, exercise.sets)}
                        <Input
                          value={reps[exercise.slug] ?? ""}
                          onChange={event =>
                            setReps(current => ({
                              ...current,
                              [exercise.slug]: event.target.value,
                            }))
                          }
                          inputMode="numeric"
                          placeholder={exercise.reps}
                          className="mt-1 border-white/10 bg-black/20 text-white backdrop-blur-sm"
                        />
                      </label>
                    )}
                    <label className="w-full text-xs text-muted-foreground sm:w-28">
                      Load kg
                      <Input
                        value={load[exercise.slug] ?? ""}
                        onChange={event =>
                          setLoad(current => ({
                            ...current,
                            [exercise.slug]: event.target.value,
                          }))
                        }
                        inputMode="decimal"
                        placeholder="0"
                        className="mt-1 border-white/10 bg-black/20 text-white backdrop-blur-sm"
                      />
                    </label>
                    <label className="w-full text-xs text-muted-foreground sm:w-24">
                      RPE
                      <Input
                        value={rpe[exercise.slug] ?? ""}
                        onChange={event =>
                          setRpe(current => ({
                            ...current,
                            [exercise.slug]: event.target.value,
                          }))
                        }
                        inputMode="numeric"
                        placeholder="1–10"
                        className="mt-1 border-white/10 bg-black/20 text-white backdrop-blur-sm"
                      />
                    </label>
                    <Button
                      onClick={() => handleLogSet(exercise.slug, exercise)}
                      disabled={
                        count >= exercise.sets ||
                        logSet.isPending ||
                        (exercise.mode === "timed" &&
                          (exerciseTimers[exercise.slug] ??
                            exercise.targetSeconds ??
                            0) > 0)
                      }
                      className="gap-2 bg-primary text-primary-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4" />{" "}
                      {count >= exercise.sets
                        ? "Complete"
                        : exercise.mode === "timed" &&
                            (exerciseTimers[exercise.slug] ??
                              exercise.targetSeconds ??
                              0) > 0
                          ? "Finish timer first"
                          : `Log set ${count + 1}`}
                    </Button>
                  </div>
                )}
                {session && (
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    <p
                      className={
                        count >= exercise.sets
                          ? "text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      {count} / {exercise.sets} sets logged
                    </p>
                    {count >= exercise.sets && (
                      <span className="inline-flex items-center gap-1 font-semibold text-primary animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="h-4 w-4" /> Exercise complete
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {!session && (
            <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                Start the session to begin the timer, track each set, and see
                your workout build in real time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {session && !complete.isSuccess && (
        <Card className="border-primary/20 bg-primary/[0.04] backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">
              Close the feedback loop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-muted-foreground">
                Energy (1–5)
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={energy}
                  onChange={event => setEnergy(event.target.value)}
                  className="mt-1 border-white/10 bg-black/20 text-white backdrop-blur-sm"
                />
              </label>
              <label className="text-sm text-muted-foreground">
                Difficulty (1–5)
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={difficulty}
                  onChange={event => setDifficulty(event.target.value)}
                  className="mt-1 border-white/10 bg-black/20 text-white backdrop-blur-sm"
                />
              </label>
            </div>
            <label className="block text-sm text-muted-foreground">
              Session notes
              <Input
                value={notes}
                onChange={event => setNotes(event.target.value)}
                placeholder="How did this feel?"
                className="mt-1 border-white/10 bg-black/20 text-white backdrop-blur-sm"
              />
            </label>
            <Button
              onClick={finishSession}
              disabled={!allSetsLogged || complete.isPending}
              className="gap-2 bg-primary text-primary-foreground"
            >
              <Send className="h-4 w-4" />{" "}
              {complete.isPending
                ? "Saving…"
                : allSetsLogged
                  ? "Complete workout"
                  : "Log all sets to finish"}
            </Button>
          </CardContent>
        </Card>
      )}
      {complete.isSuccess && (
        <Card className="border-primary/30 bg-primary/10">
          <CardContent className="flex items-center gap-3 p-5 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">
              Workout complete. Your session is saved and your next plan will
              learn from it.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Clock3;
}) {
  return (
    <Card className="border-white/10 bg-card/70">
      <CardContent className="flex items-center gap-3 p-4">
        <Icon className="h-4 w-4 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-semibold text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
