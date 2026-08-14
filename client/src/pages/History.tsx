import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Clock3, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function History() {
  const history = trpc.history.list.useQuery();
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 pb-12 sm:p-8">
      <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </Button>
      <header>
        <Badge className="bg-primary/10 text-primary">TRAINING RECORD</Badge>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          Workout history
        </h1>
        <p className="mt-2 text-muted-foreground">
          A record of what you completed, including the feedback that shapes
          future adaptation.
        </p>
      </header>
      {history.isLoading && (
        <p className="text-muted-foreground">Loading training history…</p>
      )}
      {!history.isLoading && history.data?.length === 0 && (
        <Card className="border-white/10 bg-card/70">
          <CardContent className="p-8 text-center text-muted-foreground">
            Your completed sessions will appear here after your first workout.
          </CardContent>
        </Card>
      )}
      <div className="space-y-3">
        {history.data?.map(item => (
          <Card key={item.id} className="border-white/10 bg-card/70">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary">
                  {item.workoutDate} · {item.goal}
                </p>
                <CardTitle className="mt-2 text-xl text-white">
                  {item.title}
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className={
                  item.status === "completed"
                    ? "border-primary/30 text-primary"
                    : "border-white/15 text-white/60"
                }
              >
                {item.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-primary" />
                  {item.durationMinutes} minutes
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  {item.setCount} sets logged
                </span>
                {item.completedAt && (
                  <span className="inline-flex items-center gap-1.5 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </span>
                )}
              </div>
              {(item.energy || item.difficulty || item.notes) && (
                <p className="mt-4 border-t border-white/10 pt-4 text-sm text-muted-foreground">
                  Feedback: energy {item.energy ?? "—"}/5, difficulty{" "}
                  {item.difficulty ?? "—"}/5
                  {item.notes ? ` · ${item.notes}` : ""}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
