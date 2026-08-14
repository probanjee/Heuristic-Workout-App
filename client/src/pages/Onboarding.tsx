import { Button } from "@/components/ui/button";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getOnboardingProfileState } from "@/lib/onboardingState";

const steps = [
  "Basic Info",
  "Fitness Goal",
  "Experience",
  "Workout Preferences",
  "Equipment",
  "Schedule",
  "Recovery",
  "Personalized Plan",
];

type FormState = {
  age: string;
  gender: string;
  heightCm: string;
  weightKg: string;
  primaryGoal: string;
  secondaryGoal: string;
  fitnessLevel: string;
  workoutDaysPerWeek: string;
  workoutDurationMinutes: string;
  environment: string;
  equipment: string;
  preferredWorkoutTime: string;
  exerciseExclusions: string;
  sleepQuality: string;
  fatigueLevel: string;
  recoveryFeeling: string;
};

const initialForm: FormState = {
  age: "",
  gender: "",
  heightCm: "",
  weightKg: "",
  primaryGoal: "",
  secondaryGoal: "",
  fitnessLevel: "",
  workoutDaysPerWeek: "",
  workoutDurationMinutes: "",
  environment: "",
  equipment: "",
  preferredWorkoutTime: "",
  exerciseExclusions: "",
  sleepQuality: "",
  fatigueLevel: "",
  recoveryFeeling: "",
};

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const profile = trpc.profile.get.useQuery();
  const save = trpc.profile.save.useMutation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const percent = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  useEffect(() => {
    if (!profile.data) {
      const emptyState = getOnboardingProfileState(profile.data);
      setStep(emptyState.step);
      return;
    }
    const p = profile.data;
    setStep(getOnboardingProfileState(p).step);
    setForm({
      age: p.age?.toString() || "",
      gender: p.gender || "",
      heightCm: p.heightCm?.toString() || "",
      weightKg: p.weightKg?.toString() || "",
      primaryGoal: p.primaryGoal || "",
      secondaryGoal: p.secondaryGoal || "",
      fitnessLevel: p.fitnessLevel || "",
      workoutDaysPerWeek: p.workoutDaysPerWeek?.toString() || "",
      workoutDurationMinutes: p.workoutDurationMinutes?.toString() || "",
      environment: p.environment || "",
      equipment: p.equipment || "",
      preferredWorkoutTime: p.preferredWorkoutTime || "",
      exerciseExclusions: p.exerciseExclusions || "",
      sleepQuality: p.sleepQuality?.toString() || "",
      fatigueLevel: p.fatigueLevel?.toString() || "",
      recoveryFeeling: p.recoveryFeeling || "",
    });
  }, [profile.data]);

  const update = (key: keyof FormState, value: string) =>
    setForm(current => ({ ...current, [key]: value }));
  const numeric = (value: string) => (value ? Number(value) : null);
  const saveStep = async (nextStep: number, completed = false) => {
    await save.mutateAsync({
      onboardingStep: nextStep,
      onboardingCompleted: completed,
      age: numeric(form.age),
      gender: form.gender || null,
      heightCm: numeric(form.heightCm),
      weightKg: numeric(form.weightKg),
      primaryGoal: form.primaryGoal || null,
      secondaryGoal: form.secondaryGoal || null,
      fitnessLevel: form.fitnessLevel || null,
      workoutDaysPerWeek: numeric(form.workoutDaysPerWeek),
      workoutDurationMinutes: numeric(form.workoutDurationMinutes),
      environment: form.environment || null,
      equipment: form.equipment || null,
      preferredWorkoutTime: form.preferredWorkoutTime || null,
      exerciseExclusions: form.exerciseExclusions || null,
      sleepQuality: numeric(form.sleepQuality),
      fatigueLevel: numeric(form.fatigueLevel),
      recoveryFeeling: form.recoveryFeeling || null,
    });
  };
  const next = async () => {
    if (step === steps.length - 1) {
      await saveStep(8, true);
      setLocation("/");
      return;
    }
    await saveStep(step + 1);
    setStep(value => value + 1);
  };
  const back = () => setStep(value => Math.max(0, value - 1));

  if (profile.isLoading)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-3xl px-2 pb-12 sm:px-4 lg:px-8">
      <OnboardingProfileMarker profile={profile.data} />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Adaptive setup
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Build your training profile
          </h1>
        </div>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-white"
          onClick={() => setLocation("/")}
        >
          Skip for now
        </Button>
      </div>
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {step + 1} of {steps.length}
          </span>
          <span>{steps[step]}</span>
        </div>
        <Progress
          value={percent}
          className="h-2 bg-white/10 [&>div]:bg-primary"
        />
      </div>
      <Card className="border-white/10 bg-card/80">
        <CardHeader>
          <CardTitle className="text-2xl text-white">{steps[step]}</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            A few focused inputs help us shape a safer, more useful first plan.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep(step, form, update)}
          {save.error && (
            <p className="text-sm text-destructive">
              We could not save this step. Please review the values and try
              again.
            </p>
          )}
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <Button
              variant="ghost"
              onClick={back}
              disabled={step === 0}
              className="gap-2 text-muted-foreground hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={next}
              disabled={save.isPending}
              className="gap-2 bg-primary font-semibold text-primary-foreground"
            >
              {save.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : step === steps.length - 1 ? (
                <Check className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {step === steps.length - 1
                ? "Create my adaptive plan"
                : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function OnboardingProfileMarker({
  profile,
}: {
  profile: { onboardingStep?: number } | null | undefined;
}) {
  const state = getOnboardingProfileState(profile);
  return (
    <span
      data-profile-state={state.hasProfile ? "hydrated" : "new"}
      className="sr-only"
    >
      Profile {state.hasProfile ? "loaded" : "ready"}
    </span>
  );
}

function renderStep(
  step: number,
  form: FormState,
  update: (key: keyof FormState, value: string) => void
) {
  if (step === 0)
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Age"
          hint="Years"
          value={form.age}
          onChange={value => update("age", value)}
          type="number"
        />
        <Field
          label="Height"
          hint="Centimeters"
          value={form.heightCm}
          onChange={value => update("heightCm", value)}
          type="number"
        />
        <Field
          label="Weight"
          hint="Kilograms"
          value={form.weightKg}
          onChange={value => update("weightKg", value)}
          type="number"
        />
        <SelectField
          label="Gender"
          value={form.gender}
          onChange={value => update("gender", value)}
          options={[
            ["female", "Female"],
            ["male", "Male"],
            ["non-binary", "Non-binary"],
            ["prefer-not-to-say", "Prefer not to say"],
          ]}
        />{" "}
      </div>
    );
  if (step === 1)
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Primary goal"
          value={form.primaryGoal}
          onChange={value => update("primaryGoal", value)}
          options={[
            ["fat-loss", "Fat loss"],
            ["muscle-gain", "Muscle gain"],
            ["strength", "Strength"],
            ["endurance", "Endurance"],
            ["mobility", "Mobility"],
            ["consistency", "Consistency"],
          ]}
        />
        <SelectField
          label="Secondary goal"
          value={form.secondaryGoal}
          onChange={value => update("secondaryGoal", value)}
          options={[
            ["general-fitness", "General fitness"],
            ["mobility", "Mobility"],
            ["consistency", "Consistency"],
            ["none", "None"],
          ]}
        />
      </div>
    );
  if (step === 2)
    return (
      <SelectField
        label="Current experience"
        value={form.fitnessLevel}
        onChange={value => update("fitnessLevel", value)}
        options={[
          ["beginner", "Beginner"],
          ["intermediate", "Intermediate"],
          ["advanced", "Advanced"],
        ]}
      />
    );
  if (step === 3)
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Days per week"
          hint="1–7"
          value={form.workoutDaysPerWeek}
          onChange={value => update("workoutDaysPerWeek", value)}
          type="number"
        />
        <Field
          label="Preferred duration"
          hint="Minutes"
          value={form.workoutDurationMinutes}
          onChange={value => update("workoutDurationMinutes", value)}
          type="number"
        />
        <SelectField
          label="Training environment"
          value={form.environment}
          onChange={value => update("environment", value)}
          options={[
            ["home", "Home"],
            ["gym", "Gym"],
            ["outdoors", "Outdoors"],
            ["mixed", "Mixed"],
          ]}
        />
      </div>
    );
  if (step === 4)
    return (
      <TextField
        label="Available equipment"
        value={form.equipment}
        placeholder="Dumbbells, mat, resistance bands"
        onChange={value => update("equipment", value)}
      />
    );
  if (step === 5)
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Preferred workout time"
          hint="For reminders"
          value={form.preferredWorkoutTime}
          onChange={value => update("preferredWorkoutTime", value)}
          type="time"
        />
        <TextField
          label="Exercise exclusions"
          value={form.exerciseExclusions}
          placeholder="Movements or equipment to avoid"
          onChange={value => update("exerciseExclusions", value)}
        />
      </div>
    );
  if (step === 6)
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Sleep quality"
          value={form.sleepQuality}
          onChange={value => update("sleepQuality", value)}
          options={[
            ["1", "1 — Very low"],
            ["2", "2 — Low"],
            ["3", "3 — Moderate"],
            ["4", "4 — Good"],
            ["5", "5 — Excellent"],
          ]}
        />
        <SelectField
          label="Current fatigue"
          value={form.fatigueLevel}
          onChange={value => update("fatigueLevel", value)}
          options={[
            ["1", "1 — Fresh"],
            ["2", "2 — Light"],
            ["3", "3 — Moderate"],
            ["4", "4 — High"],
            ["5", "5 — Very high"],
          ]}
        />
        <SelectField
          label="Recovery feeling"
          value={form.recoveryFeeling}
          onChange={value => update("recoveryFeeling", value)}
          options={[
            ["ready", "Ready to train"],
            ["okay", "Could train"],
            ["recover", "Need recovery"],
          ]}
        />
      </div>
    );
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-6">
      <Sparkles className="h-6 w-6 text-primary" />
      <h3 className="mt-4 text-xl font-semibold text-white">
        Your adaptive plan is ready to take shape.
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Your saved profile will shape each workout around your goals, time,
        equipment, recovery, and recent progress. You will also see why each
        session was chosen.
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-white">
        {label}{" "}
        <span className="text-xs font-normal text-muted-foreground">
          {hint}
        </span>
      </Label>
      <Input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="border-white/10 bg-white/[0.03] text-white"
      />
    </div>
  );
}
function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2 sm:col-span-2">
      <Label className="text-white">{label}</Label>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        className="border-white/10 bg-white/[0.03] text-white placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <div className="space-y-2">
      <Label className="text-white">{label}</Label>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors focus:ring-2 focus:ring-primary"
      >
        <option value="" className="bg-card text-muted-foreground">
          Choose an option
        </option>
        {options.map(([option, text]) => (
          <option key={option} value={option} className="bg-card text-white">
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
