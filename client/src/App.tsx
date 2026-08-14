import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import FeaturePlaceholder from "@/pages/FeaturePlaceholder";
import {
  Consistency,
  Exercises,
  Notifications,
  Profile,
  Recommendations,
  Settings,
} from "@/pages/PlatformModules";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Workout from "./pages/Workout";
import History from "./pages/History";
import Progress from "./pages/Progress";
import Assistant from "./pages/Assistant";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/workout" component={Workout} />
        <Route path="/history" component={History} />
        <Route path="/progress" component={Progress} />
        <Route path="/assistant" component={Assistant} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/exercises" component={Exercises} />
        <Route path="/recommendations" component={Recommendations} />
        <Route path="/consistency" component={Consistency} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route path="/:feature" component={FeaturePlaceholder} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
