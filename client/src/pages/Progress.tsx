import { Link } from "wouter";
import { WorkoutVisuals } from "@/pages/PlatformModules";
import { ArrowLeft, Flame, Gauge, Timer, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";

export default function Progress() {
  const [range, setRange] = useState(30);
  const summaryInput = useMemo(() => ({ days: range }), [range]);
  const summary = trpc.progress.summary.useQuery(summaryInput);
  const data = summary.data;
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pb-12 sm:p-8">
      <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </Button>
      <header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge className="bg-primary/10 text-primary">
              PERFORMANCE SIGNALS
            </Badge>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
              Progress analytics
            </h1>
            <p className="mt-2 text-muted-foreground">
              A clear view of the sessions completed and feedback returned to
              the adaptive engine.
            </p>
          </div>
          <div
            className="flex gap-2"
            role="group"
            aria-label="Chart date range"
          >
            {[7, 30, 90, 180].map(days => (
              <Button
                key={days}
                size="sm"
                variant={range === days ? "default" : "outline"}
                onClick={() => setRange(days)}
              >
                {days}d
              </Button>
            ))}
          </div>
        </div>
      </header>
      {summary.isLoading && (
        <p className="text-muted-foreground">Calculating your baseline…</p>
      )}
      {summary.isError && (
        <Card className="border-destructive/30 bg-card/70">
          <CardContent className="p-6 text-sm text-destructive">
            We could not load your progress yet. Refresh after signing in to
            continue.
          </CardContent>
        </Card>
      )}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Completed"
              value={`${data.completedSessions}`}
              detail={`${data.completionRate}% completion`}
              icon={Trophy}
            />
            <Metric
              label="Training time"
              value={`${data.totalMinutes}m`}
              detail="completed minutes"
              icon={Timer}
            />
            <Metric
              label="Current streak"
              value={`${data.currentStreak}`}
              detail="consecutive days"
              icon={Flame}
            />
            <Metric
              label="Avg difficulty"
              value={
                data.averageDifficulty === null
                  ? "—"
                  : `${data.averageDifficulty}/5`
              }
              detail={`energy ${data.averageEnergy ?? "—"}/5`}
              icon={Gauge}
            />
          </div>
          <Card className="border-white/10 bg-card/70">
            <CardHeader>
              <CardTitle className="text-white">
                Seven-day consistency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-end gap-2">
                {data.trend.map(day => (
                  <div
                    key={day.date}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className={`w-full max-w-10 rounded-t-lg transition-all ${day.completed ? "h-28 bg-primary shadow-[0_0_24px_rgba(191,255,0,0.22)]" : "h-8 bg-white/10"}`}
                      title={`${day.date}: ${day.completed ? "completed" : "no completed session"}`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {day.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
              <ProgressBar
                value={data.completionRate}
                className="mt-6 h-2 bg-white/10 [&>div]:bg-primary"
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Planned sessions completed: {data.completionRate}%
              </p>
            </CardContent>
          </Card>
          <WorkoutVisuals days={range} />
        </>
      )}
    </div>
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
  icon: typeof Trophy;
}) {
  return (
    <Card className="border-white/10 bg-card/70">
      <CardContent className="p-5">
        <Icon className="h-5 w-5 text-primary" />
        <p className="mt-5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
