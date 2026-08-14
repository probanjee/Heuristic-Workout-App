import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Sparkles } from "lucide-react";
import { useLocation, useRoute } from "wouter";

const labels: Record<string, string> = {
  workout: "Today's workout",
  progress: "Progress analytics",
  history: "Workout history",
  exercises: "Exercise library",
  recommendations: "Recommendations",
  consistency: "Consistency",
  notifications: "Notifications",
  profile: "Fitness profile",
  settings: "Settings",
};

export default function FeaturePlaceholder() {
  const [, params] = useRoute("/:feature");
  const [, setLocation] = useLocation();
  const key = params?.feature || "module";
  const label = labels[key] || "Platform module";

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl border border-white/10 bg-card/70 p-8 text-center shadow-2xl shadow-black/20 sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Construction className="h-6 w-6" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Sprint 1 foundation
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {label}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
          This route is reserved in the product shell. Its server-backed
          experience will be added in the next verified increment without moving
          recommendation logic into the client.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => setLocation("/")}
            className="gap-2 bg-primary text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <Sparkles className="h-4 w-4 text-primary" /> Planned module
          </Button>
        </div>
      </div>
    </div>
  );
}
