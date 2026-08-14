import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const moduleSource = readFileSync(
  new URL("./PlatformModules.tsx", import.meta.url),
  "utf8"
);
const progressSource = readFileSync(
  new URL("./Progress.tsx", import.meta.url),
  "utf8"
);
const shellSource = readFileSync(
  new URL("../components/DashboardLayout.tsx", import.meta.url),
  "utf8"
);
const sidebarSource = readFileSync(
  new URL("../components/ui/sidebar.tsx", import.meta.url),
  "utf8"
);
const authSource = readFileSync(
  new URL("../components/AuthEntry.tsx", import.meta.url),
  "utf8"
);

describe("platform module navigation contract", () => {
  it("wires each reserved navigation path to a concrete module page", () => {
    for (const [path, component] of [
      ["/exercises", "Exercises"],
      ["/recommendations", "Recommendations"],
      ["/consistency", "Consistency"],
      ["/notifications", "Notifications"],
      ["/profile", "Profile"],
      ["/settings", "Settings"],
    ]) {
      expect(appSource).toMatch(
        new RegExp(`path=\\"${path}\\" component={${component}}`)
      );
    }
  });

  it("keeps the module data and visualization contracts server-backed", () => {
    expect(moduleSource).toContain("trpc.exercises.catalog.useQuery()");
    expect(moduleSource).toContain("trpc.recommendation.today.useQuery()");
    expect(moduleSource).toContain(
      "trpc.progress.summary.useQuery(rangeInput)"
    );
    expect(moduleSource).toContain("trpc.history.list.useQuery(rangeInput)");
    expect(moduleSource).toContain("trpc.notifications.activity.useQuery()");
    expect(moduleSource).toContain(
      "trpc.analytics.exerciseMix.useQuery(rangeInput)"
    );
    expect(moduleSource).toContain("Search name, muscle, equipment");
    expect(moduleSource).toContain(
      "Consistency data is temporarily unavailable"
    );
    expect(progressSource).toContain("Chart date range");
    expect(progressSource).toContain("<WorkoutVisuals days={range} />");
    expect(moduleSource).toContain('canvas.toDataURL("image/webp", 0.78)');
    expect(moduleSource).toContain('role="img"');
    expect(moduleSource).toContain("logged sets");
  });

  it("keeps profile identity and avatar changes server-backed", () => {
    expect(moduleSource).toContain("trpc.profile.updateIdentity.useMutation()");
    expect(moduleSource).toContain("trpc.profile.uploadAvatar.useMutation()");
    expect(moduleSource).toContain("AvatarImage");
    expect(moduleSource).toContain("Body weight (kg)");
  });

  it("exposes hamburger controls and avoids the removed login eyebrow", () => {
    expect(shellSource).toContain('aria-label="Open Menu"');
    expect(shellSource).toContain("Menu");
    expect(sidebarSource).toContain('import { Menu } from "lucide-react"');
    expect(sidebarSource).toContain('<Menu className="h-4 w-4" />');
    expect(sidebarSource).not.toContain("PanelLeftIcon");
    expect(shellSource).not.toContain('aria-label="Open profile"');
    expect(shellSource).not.toContain("AvatarFallback");
    expect(shellSource).not.toContain("Sign out");
    expect(moduleSource).toContain("const { logout } = useAuth()");
    expect(moduleSource).toContain("Sign out");
    expect(authSource).not.toContain('"Welcome back"');
    expect(authSource).toContain("auth-scene");
  });
});
