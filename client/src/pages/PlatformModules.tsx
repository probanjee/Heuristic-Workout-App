import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Bell,
  Camera,
  Loader2,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Gauge,
  Layers3,
  LockKeyhole,
  LogOut,
  Settings2,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

function ModuleHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header>
      <Button
        asChild
        variant="ghost"
        className="mb-5 gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-white"
      >
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </Button>
      <Badge className="bg-primary/10 text-primary">{eyebrow}</Badge>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
    </header>
  );
}

function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`border-white/10 bg-card/70 shadow-xl shadow-black/10 ${className}`}
    >
      {children}
    </Card>
  );
}

export function Exercises() {
  const query = trpc.exercises.catalog.useQuery();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const exercises = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = query.data ?? [];
    return rows.filter(exercise => {
      const matchesFilter =
        filter === "all" || exercise.primaryMuscle === filter;
      const haystack =
        `${exercise.name} ${exercise.primaryMuscle} ${exercise.equipment} ${exercise.movementPattern}`.toLowerCase();
      return matchesFilter && (!term || haystack.includes(term));
    });
  }, [filter, query.data, search]);
  const muscles = Array.from(
    new Set((query.data ?? []).map(exercise => exercise.primaryMuscle))
  );

  return (
    <div className="mx-auto max-w-6xl space-y-7 p-4 pb-12 sm:p-8">
      <ModuleHeader
        eyebrow="VERIFIED MOVEMENT LIBRARY"
        title="Exercises"
        description="Explore the system-verified movements used by the adaptive engine, with cues, loading guidance, and substitutions."
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search name, muscle, equipment…"
            className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-white outline-none placeholder:text-muted-foreground focus:border-primary/60"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", ...muscles].map(value => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? "default" : "outline"}
              onClick={() => setFilter(value)}
              className="capitalize"
            >
              {value === "all" ? "All movements" : value}
            </Button>
          ))}
        </div>
      </div>
      {query.isLoading && (
        <p className="text-muted-foreground">Loading verified movements…</p>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exercises.map(exercise => (
          <Surface key={exercise.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-xl text-white">
                  {exercise.name}
                </CardTitle>
                <Badge variant="outline" className="capitalize">
                  {exercise.difficulty}
                </Badge>
              </div>
              <p className="text-sm text-primary">
                {exercise.primaryMuscle} · {exercise.movementPattern}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {exercise.instructions}
              </p>
              <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Equipment</p>
                  <p className="mt-1 font-medium text-white">
                    {exercise.equipment}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sets × reps</p>
                  <p className="mt-1 font-medium text-white">
                    {exercise.defaultSets} × {exercise.defaultReps}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rest</p>
                  <p className="mt-1 font-medium text-white">
                    {exercise.restSeconds}s
                  </p>
                </div>
              </div>
            </CardContent>
          </Surface>
        ))}
      </div>
      {!query.isLoading && exercises.length === 0 && (
        <Surface>
          <CardContent className="p-8 text-center text-muted-foreground">
            No verified movements match this filter.
          </CardContent>
        </Surface>
      )}
    </div>
  );
}

export function Recommendations() {
  const query = trpc.recommendation.today.useQuery();
  const recommendation = query.data;
  return (
    <div className="mx-auto max-w-5xl space-y-7 p-4 pb-12 sm:p-8">
      <ModuleHeader
        eyebrow="ADAPTIVE DECISION ENGINE"
        title="Recommendations"
        description="Understand why today's plan was selected. The recommendation remains deterministic and server-owned; this view only explains the result."
      />
      {recommendation?.status === "ready" ? (
        <>
          <Surface className="overflow-hidden">
            <CardContent className="relative p-7 sm:p-10">
              <div className="absolute right-8 top-8 text-primary/20">
                <Sparkles className="h-24 w-24" />
              </div>
              <Badge className="bg-primary/10 text-primary">
                READY FOR TODAY
              </Badge>
              <h2 className="mt-5 max-w-2xl text-3xl font-semibold text-white">
                {recommendation.title}
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                {recommendation.summary}
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <Metric
                  label="Duration"
                  value={`${recommendation.durationMinutes}m`}
                  icon={Clock3}
                />
                <Metric
                  label="Exercises"
                  value={`${recommendation.exerciseCount}`}
                  icon={Dumbbell}
                />
                <Metric
                  label="Goal fit"
                  value={recommendation.goalFit}
                  icon={Target}
                />
              </div>
            </CardContent>
          </Surface>
          <Surface>
            <CardHeader>
              <CardTitle className="text-white">Decision signals</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {recommendation.reasons.map(reason => (
                <div
                  key={reason}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {reason.replaceAll("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Applied by the adaptive ruleset
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Surface>
        </>
      ) : (
        <Surface>
          <CardContent className="p-8">
            <p className="font-medium text-white">
              Complete your profile to unlock recommendations.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Missing:{" "}
              {recommendation?.missingFields?.join(", ") ?? "profile data"}.
            </p>
            <Button asChild className="mt-5">
              <Link href="/onboarding">
                Continue onboarding <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Surface>
      )}
    </div>
  );
}

export function Consistency() {
  const query = trpc.progress.summary.useQuery();
  const data = query.data;
  return (
    <div className="mx-auto max-w-5xl space-y-7 p-4 pb-12 sm:p-8">
      <ModuleHeader
        eyebrow="CONSISTENCY SYSTEM"
        title="Your rhythm"
        description="Consistency is measured from completed sessions, not planned intentions. Use the trend to see where your training habit is strongest."
      />
      {query.isLoading && (
        <Surface>
          <CardContent className="p-8 text-sm text-muted-foreground">
            Loading consistency data…
          </CardContent>
        </Surface>
      )}
      {query.error && (
        <Surface>
          <CardContent className="p-8 text-sm text-muted-foreground">
            Consistency data is temporarily unavailable. Return to the dashboard
            and try again.
          </CardContent>
        </Surface>
      )}
      {!query.isLoading && !query.error && !data && (
        <Surface>
          <CardContent className="p-8 text-sm text-muted-foreground">
            Complete onboarding and a workout to start building your consistency
            record.
          </CardContent>
        </Surface>
      )}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric
              label="Current streak"
              value={`${data.currentStreak} days`}
              icon={Flame}
            />
            <Metric
              label="Completion rate"
              value={`${data.completionRate}%`}
              icon={TrendingUp}
            />
            <Metric
              label="Sessions"
              value={`${data.completedSessions}`}
              icon={Check}
            />
          </div>
          <Surface>
            <CardHeader>
              <CardTitle className="text-white">Last seven days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 sm:gap-4">
                {data.trend.map(day => (
                  <div key={day.date} className="text-center">
                    <div
                      className={`mx-auto flex h-24 items-end justify-center rounded-xl p-2 ${day.completed ? "bg-primary/15" : "bg-white/[0.04]"}`}
                    >
                      <div
                        className={`w-full rounded-md ${day.completed ? "h-full bg-primary shadow-[0_0_24px_rgba(191,255,0,0.28)]" : "h-2 bg-white/10"}`}
                      />
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      {day.date.slice(5)}
                    </p>
                  </div>
                ))}
              </div>
              <ProgressBar
                value={data.completionRate}
                className="mt-7 h-2 bg-white/10 [&>div]:bg-primary"
              />
            </CardContent>
          </Surface>
        </>
      )}
    </div>
  );
}

export function Notifications() {
  const profile = trpc.profile.get.useQuery();
  const activity = trpc.notifications.activity.useQuery();
  const save = trpc.reminders.preferences.useMutation({
    onSuccess: () => {
      profile.refetch();
      toast.success("Notification preference saved.");
    },
  });
  const enabled = Boolean(profile.data?.reminderEnabled);
  const preferred = profile.data?.preferredWorkoutTime ?? "07:00";
  return (
    <div className="mx-auto max-w-4xl space-y-7 p-4 pb-12 sm:p-8">
      <ModuleHeader
        eyebrow="RECOVERY-AWARE DELIVERY"
        title="Notifications"
        description="Control workout reminders while the scheduled delivery boundary remains safely disabled until production activation is approved."
      />
      <Surface>
        <CardContent className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Workout reminders</h2>
                <p className="text-sm text-muted-foreground">
                  {enabled
                    ? `Preferred time ${preferred}`
                    : "Reminders are currently off"}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
              Your preference is persisted to your profile. No reminder is
              dispatched while the Heartbeat callback is disabled.
            </p>
          </div>
          <Button
            disabled={save.isPending}
            onClick={() =>
              save.mutate({
                enabled: !enabled,
                preferredWorkoutTime: preferred,
              })
            }
          >
            {enabled ? "Turn off" : "Turn on"}
          </Button>
        </CardContent>
      </Surface>
      <Surface>
        <CardHeader>
          <CardTitle className="text-white">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity.data?.events.length ? (
            activity.data.events.map(event => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {event.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {event.status.replace("_", " ")}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No notification activity yet. Workout activity will appear here
              once sessions are recorded.
            </p>
          )}
        </CardContent>
      </Surface>
    </div>
  );
}

export function Profile() {
  const { logout } = useAuth();
  const profile = trpc.profile.get.useQuery();
  const user = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  const identity = trpc.profile.updateIdentity.useMutation();
  const saveProfile = trpc.profile.save.useMutation();
  const uploadAvatar = trpc.profile.uploadAvatar.useMutation();
  const changePassword = trpc.profile.changePassword.useMutation();
  const data = profile.data;
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [quotePreference, setQuotePreference] = useState("balanced");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setName(user.data?.name ?? "");
    setAge(data?.age?.toString() ?? "");
    setHeightCm(data?.heightCm?.toString() ?? "");
    setWeightKg(data?.weightKg?.toString() ?? "");
    setQuotePreference(data?.quotePreference ?? "balanced");
  }, [
    user.data?.name,
    data?.age,
    data?.heightCm,
    data?.weightKg,
    data?.quotePreference,
  ]);

  const save = async () => {
    await identity.mutateAsync({ name });
    await saveProfile.mutateAsync({
      onboardingStep: data?.onboardingStep ?? 0,
      onboardingCompleted: Boolean(data?.onboardingCompleted),
      age: age ? Number(age) : null,
      heightCm: heightCm ? Number(heightCm) : null,
      weightKg: weightKg ? Number(weightKg) : null,
      gender: data?.gender ?? null,
      fitnessLevel: data?.fitnessLevel ?? null,
      primaryGoal: data?.primaryGoal ?? null,
      secondaryGoal: data?.secondaryGoal ?? null,
      workoutDaysPerWeek: data?.workoutDaysPerWeek ?? null,
      workoutDurationMinutes: data?.workoutDurationMinutes ?? null,
      preferredWorkoutTime: data?.preferredWorkoutTime ?? null,
      environment: data?.environment ?? null,
      equipment: data?.equipment ?? null,
      exerciseExclusions: data?.exerciseExclusions ?? null,
      sleepQuality: data?.sleepQuality ?? null,
      fatigueLevel: data?.fatigueLevel ?? null,
      recoveryFeeling: data?.recoveryFeeling ?? null,
      quotePreference: quotePreference as
        | "balanced"
        | "focus"
        | "recovery"
        | "encouragement",
    });
    await Promise.all([
      utils.auth.me.invalidate(),
      utils.profile.get.invalidate(),
    ]);
    toast.success("Profile updated.");
  };

  const updatePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Use at least 8 characters for your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update password."
      );
    }
  };

  const handleAvatar = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Choose an image smaller than 5 MB.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read image"));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("Could not decode image"));
        image.onload = () => {
          const size = 512;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Image processing is unavailable"));
            return;
          }
          const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
          const sourceX = (image.naturalWidth - cropSize) / 2;
          const sourceY = (image.naturalHeight - cropSize) / 2;
          context.drawImage(
            image,
            sourceX,
            sourceY,
            cropSize,
            cropSize,
            0,
            0,
            size,
            size
          );
          const optimized = canvas.toDataURL("image/webp", 0.78);
          const optimizedBytes = Math.ceil(
            (optimized.length - optimized.indexOf(",") - 1) * 0.75
          );
          if (optimizedBytes > 1.5 * 1024 * 1024) {
            resolve(canvas.toDataURL("image/webp", 0.62));
          } else {
            resolve(optimized);
          }
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
    await uploadAvatar.mutateAsync({
      fileName: `${file.name.replace(/\\.[^/.]+$/, "")}.webp`,
      contentType: "image/webp",
      dataUrl,
    });
    await utils.profile.get.invalidate();
    toast.success("Profile photo updated.");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7 p-4 pb-12 sm:p-8">
      <ModuleHeader
        eyebrow="ATHLETE PROFILE"
        title="Profile"
        description="Your identity, body metrics, and adaptive training inputs in one place."
      />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Surface>
          <CardHeader>
            <div className="flex items-center gap-4">
              <label className="group relative cursor-pointer">
                <Avatar className="h-20 w-20 border border-primary/40 shadow-[0_0_24px_rgba(191,255,0,0.15)]">
                  <AvatarImage
                    src={data?.avatarUrl ?? undefined}
                    alt={`${name || "Athlete"} profile photo`}
                  />
                  <AvatarFallback className="bg-primary/15 text-xl text-primary">
                    {(name || "A").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                  {uploadAvatar.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </span>
                <input
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={event => {
                    const file = event.target.files?.[0];
                    if (file) void handleAvatar(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <div>
                <CardTitle className="text-white">
                  {name || "Athlete"}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tap the photo to upload a profile picture
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileInput label="Full name" value={name} onChange={setName} />
              <ProfileInput
                label="Email"
                value={user.data?.email ?? "Not provided"}
                onChange={() => undefined}
                disabled
              />
              <ProfileInput
                label="Age"
                value={age}
                onChange={setAge}
                type="number"
              />
              <ProfileInput
                label="Height (cm)"
                value={heightCm}
                onChange={setHeightCm}
                type="number"
              />
              <ProfileInput
                label="Body weight (kg)"
                value={weightKg}
                onChange={setWeightKg}
                type="number"
              />
            </div>
            <label className="block text-sm text-muted-foreground">
              Motivation style
              <select
                value={quotePreference}
                onChange={event => setQuotePreference(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-primary/60"
              >
                <option value="balanced">Balanced</option>
                <option value="focus">Focused</option>
                <option value="recovery">Recovery-minded</option>
                <option value="encouragement">Encouraging</option>
              </select>
              <span className="mt-1 block text-xs text-muted-foreground">
                Choose the tone shown in your dashboard’s rotating training
                quotes.
              </span>
            </label>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-4 flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-white">Password</p>
                  <p className="text-xs text-muted-foreground">
                    Change it securely from your profile.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ProfileInput
                  label="Current password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  type="password"
                />
                <ProfileInput
                  label="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                  type="password"
                />
                <ProfileInput
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  type="password"
                />
              </div>
              <Button
                onClick={() => void updatePassword()}
                disabled={
                  changePassword.isPending ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                variant="outline"
                className="mt-4"
              >
                {changePassword.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Change password
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => void save()}
                disabled={identity.isPending || saveProfile.isPending}
                className="w-full sm:w-auto"
              >
                {identity.isPending || saveProfile.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save profile
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void logout()}
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
            <ProfileRow
              label="Primary goal"
              value={data?.primaryGoal?.replaceAll("_", " ") ?? "Not set"}
            />
            <ProfileRow
              label="Experience"
              value={data?.fitnessLevel ?? "Not set"}
            />
            <ProfileRow
              label="Environment"
              value={data?.environment ?? "Not set"}
            />
          </CardContent>
        </Surface>
        <Surface>
          <CardContent className="flex h-full flex-col justify-between p-7">
            <div>
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="mt-5 text-xl font-semibold text-white">
                Adaptive profile status
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {data?.onboardingCompleted
                  ? "Your profile is complete and actively shaping recommendations."
                  : "Finish onboarding to unlock a plan shaped around your training profile."}
              </p>
            </div>
            <Button asChild className="mt-8 w-full">
              <Link href="/onboarding">
                {data?.onboardingCompleted
                  ? "Review onboarding"
                  : "Complete profile"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Surface>
      </div>
    </div>
  );
}

export function Settings() {
  const user = trpc.auth.me.useQuery();
  const profile = trpc.profile.get.useQuery();
  return (
    <div className="mx-auto max-w-4xl space-y-7 p-4 pb-12 sm:p-8">
      <ModuleHeader
        eyebrow="PLATFORM CONTROLS"
        title="Settings"
        description="Review account, privacy, and platform behavior. Provider credentials and scheduled delivery remain managed outside the client."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SettingCard
          icon={LockKeyhole}
          title="Authentication"
          detail={`Signed in with ${user.data?.loginMethod ?? "managed session"}.`}
        />
        <SettingCard
          icon={Settings2}
          title="Adaptive behavior"
          detail={`Recovery signal: ${profile.data?.recoveryFeeling ?? "not configured"}.`}
        />
        <SettingCard
          icon={Bell}
          title="Delivery boundary"
          detail="Heartbeat callbacks are disabled until deployment approval."
        />
        <SettingCard
          icon={ShieldCheck}
          title="Privacy"
          detail="Your workout records are scoped to your authenticated account."
        />
      </div>
    </div>
  );
}

export function WorkoutVisuals({ days = 30 }: { days?: number }) {
  const rangeInput = useMemo(() => ({ days }), [days]);
  const progress = trpc.progress.summary.useQuery(rangeInput);
  const history = trpc.history.list.useQuery(rangeInput);
  const mix = trpc.analytics.exerciseMix.useQuery(rangeInput);
  const rows = history.data ?? [];
  const volume = rows.reduce((sum, row) => sum + (row.setCount ?? 0), 0);
  const maxSets = Math.max(
    1,
    ...(mix.data ?? []).slice(0, 5).map(item => item.sets)
  );
  const maxMinutes = Math.max(
    1,
    ...rows.slice(0, 7).map(row => row.durationMinutes)
  );
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <Surface>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Training cockpit</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              A visual read on completed work, volume, and consistency.
            </p>
          </div>
          <Gauge className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-7">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Session duration
            </p>
            <div className="flex h-36 items-end gap-2">
              {rows
                .slice(0, 7)
                .reverse()
                .map(row => (
                  <div
                    key={row.id}
                    className="relative flex flex-1 flex-col items-center gap-2"
                    onMouseEnter={() => setHovered(`duration-${row.id}`)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(`duration-${row.id}`)}
                    onBlur={() => setHovered(null)}
                    tabIndex={0}
                  >
                    {hovered === `duration-${row.id}` && (
                      <div
                        id={`duration-tip-${row.id}`}
                        role="tooltip"
                        className="absolute bottom-full z-10 mb-2 rounded-lg border border-primary/30 bg-black/90 px-3 py-2 text-xs text-white shadow-xl"
                      >
                        <strong>{row.durationMinutes} min</strong>
                        <span className="ml-2 text-muted-foreground">
                          {row.workoutDate}
                        </span>
                      </div>
                    )}
                    <div
                      className="w-full rounded-t-lg bg-primary/80 transition-opacity hover:opacity-80"
                      style={{
                        height: `${Math.max(12, (row.durationMinutes / maxMinutes) * 100)}%`,
                      }}
                      role="img"
                      aria-label={`${row.durationMinutes} minutes on ${row.workoutDate}`}
                      aria-describedby={`duration-tip-${row.id}`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {row.workoutDate.slice(5)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <div className="space-y-4">
            <MiniStat icon={Layers3} label="Logged sets" value={`${volume}`} />
            <MiniStat
              icon={Timer}
              label="Training minutes"
              value={`${progress.data?.totalMinutes ?? 0}`}
            />
            <MiniStat
              icon={Flame}
              label="Active streak"
              value={`${progress.data?.currentStreak ?? 0}d`}
            />
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Exercise mix
          </p>
          <div className="space-y-3">
            {(mix.data ?? []).slice(0, 5).map(item => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setHovered(`mix-${item.name}`)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(`mix-${item.name}`)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
              >
                {hovered === `mix-${item.name}` && (
                  <div
                    id={`mix-tip-${item.name}`}
                    role="tooltip"
                    className="absolute right-0 bottom-full z-10 mb-2 rounded-lg border border-primary/30 bg-black/90 px-3 py-2 text-xs text-white shadow-xl"
                  >
                    {item.name}: {item.sets} logged sets
                  </div>
                )}
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-white">{item.name}</span>
                  <span className="text-muted-foreground">
                    {item.sets} sets
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${Math.max(8, (item.sets / maxSets) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {!mix.data?.length && (
              <p className="text-sm text-muted-foreground">
                Complete a workout to populate exercise mix.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Surface>
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
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Layers3;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <strong className="text-white">{value}</strong>
    </div>
  );
}
function ProfileInput({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-2 text-sm text-muted-foreground">
      <span>{label}</span>
      <Input
        value={value}
        type={type}
        disabled={disabled}
        onChange={event => onChange(event.target.value)}
        className="border-white/10 bg-white/[0.04] text-white"
      />
    </label>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium capitalize text-white">
        {value}
      </span>
    </div>
  );
}
function SettingCard({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof LockKeyhole;
  title: string;
  detail: string;
}) {
  return (
    <Surface>
      <CardContent className="p-6">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="mt-5 font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
      </CardContent>
    </Surface>
  );
}
