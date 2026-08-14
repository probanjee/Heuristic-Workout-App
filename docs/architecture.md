# Adaptive Fitness Platform — Sprint 1 Architecture

## Product boundary

The platform evolves the original Python heuristic workout concept into a persistent, multi-client adaptive fitness product. The recommendation engine remains a server-owned business capability. Web and Android clients consume the same contracts and never implement workout selection rules locally.

## Technology decisions

| Concern               | Sprint 1 decision                                                                                                                           | Rationale                                                                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Web client            | React + TypeScript + Tailwind CSS in the initialized Vite scaffold                                                                          | Uses the existing project capabilities while preserving a maintainable typed UI foundation.                                                                                                                                                |
| Server boundary       | Existing managed Express/tRPC server procedures, organized so the domain layer can later be exposed as REST to Expo                         | Avoids replacing working scaffold infrastructure during foundation work; keeps business logic separate from UI and creates a clean migration seam for FastAPI services.                                                                    |
| Persistence           | Existing Drizzle database adapter and managed database connection                                                                           | Matches the initialized project and supports schema-first migrations. PostgreSQL remains the target relational model for the long-term Python service boundary; the current scaffold adapter is not silently misrepresented as PostgreSQL. |
| Authentication        | Existing managed OAuth/session infrastructure in Sprint 1, with an explicit JWT/refresh-token contract reserved for the Python API boundary | Provides real protected routes immediately without fabricating email/password flows. The custom credential flow is a later backend milestone.                                                                                              |
| Recommendation engine | Deterministic, explainable service with reason codes and no UI-side rules                                                                   | Preserves the original heuristic app’s strengths and creates the foundation for adaptive progression.                                                                                                                                      |
| Android               | React Native + Expo contract preparation only in Sprint 1                                                                                   | The web server and shared typed domain vocabulary are established first; the complete mobile app is deliberately deferred.                                                                                                                 |
| AI assistant          | Separate dashboard capability that explains existing recommendations and form guidance                                                      | The assistant complements, but never overrides, deterministic recommendation output.                                                                                                                                                       |

## Domain model

The first relational slice uses the existing authenticated user as the identity root. The planned model is normalized around `users`, `user_profiles`, `user_preferences`, `exercises`, `workout_plans`, `workout_sessions`, `workout_sets`, `exercise_performances`, `workout_feedback`, `recommendations`, `notifications`, and `user_streaks`. Every private record is scoped through the authenticated user context; callers never supply an authoritative user identifier for authorization.

The onboarding aggregate is ordered as follows: **Basic Info → Fitness Goal → Experience → Workout Preferences → Equipment → Schedule → Recovery → Personalized Plan**. Each step is persisted as a validated profile update, and completion triggers the recommendation service boundary.

## API architecture

The long-term Python API will expose versioned REST resources such as `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/users/me`, `PATCH /api/v1/profile`, `GET /api/v1/workouts/today`, `POST /api/v1/workouts/generate`, `POST /api/v1/workouts/{id}/sessions`, and `POST /api/v1/recommendations/explain`. Sprint 1 uses the managed typed procedure layer for the web client while keeping these resource boundaries explicit in the domain documentation.

## Recommendation-engine architecture

The engine will accept a validated fitness profile, recent history, performance, fatigue, time, equipment, and consistency context. It will apply goal alignment, muscle recovery, volume, equipment, time, preference, fatigue, progression, and consistency analysis before composing a workout. Each output contains structured reason codes such as `PROGRESSIVE_OVERLOAD`, `MUSCLE_RECOVERY`, `TIME_CONSTRAINT`, `EQUIPMENT_CONSTRAINT`, `GOAL_ALIGNMENT`, and `RECOVERY_ADJUSTMENT`, plus a human-readable explanation generated from those codes. An LLM may rephrase or explain the result, but cannot alter the selected exercises or safety constraints.

## UI route map

The authenticated web shell will reserve routes for `/`, `/workout`, `/history`, `/progress`, `/exercises`, `/recommendations`, `/notifications`, `/profile`, and `/settings`. Sprint 1 implements the dashboard command center and sign-in entry state first. The visual hierarchy is today's workout, start action, progress and consistency, recommendation explanation, history, and profile/settings.

## Sprint 1 acceptance criteria

Sprint 1 is complete when the application has a premium dark-first shell, real protected authentication through the initialized scaffold, an authenticated dashboard entry point, a documented server-owned domain boundary, a testable route structure, and no frontend code that pretends to generate workouts or fabricate user metrics. Onboarding, database entities, custom JWT credentials, recommendation generation, notifications, AI assistant, and Android screens remain explicitly tracked for the following increments.
