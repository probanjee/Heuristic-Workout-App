# Scheduled reminders and streak alerts

The Adaptive Fitness Platform keeps workout reminders and streak alerts outside the request-serving process. The future implementation must use the project Heartbeat callback under `/api/scheduled`, authenticate requests with the Heartbeat-provided cron secret, and remain idempotent so retries cannot duplicate notifications.

## Current state

The scheduled callback boundaries are implemented under `/api/scheduled/reminders` and `/api/scheduled/streak-alerts`, but they are deliberately **disabled** in the current unpublished checkpoint. Both endpoints authenticate cron-only requests and return idempotent `scheduled: false` responses without notification side effects or schedule activation. The streak-alert boundary accepts normalized consistency context for a future implementation, but it does not yet evaluate user consistency or send alerts. No production schedule should be created or enabled against this build.

## Activation prerequisites

Before activation, publish the checkpoint containing the callback implementation, confirm the live callback URL and deployment version, configure any required notification/provider credentials through the project secret manager, and create the schedule only after verifying the callback’s authorization and idempotency behavior in production. The reminder callback must use persisted user-owned reminder preferences and completed workout history; it must not use an in-process timer. The streak-alert callback must additionally consume server-side consistency data, define a tested alert threshold and deduplication policy, and pass its persistence and retry tests. Activation is a separate change and requires explicit approval after deployment verification.

## Safety boundary

Do not call either callback from browser code, do not create a Heartbeat schedule while these endpoints return `deployment_required`, and do not infer a user's streak from client-provided values. The current streak context fields are diagnostic boundary inputs only; they are not authoritative notification decisions.

## Credential boundary

Twilio and Resend credentials remain optional for development because the authentication service has safe mock providers. Production SMS or email delivery requires the corresponding provider secrets and sender configuration. Missing production credentials must produce a controlled configuration state rather than exposing verification codes or silently claiming delivery.

## Ready-to-activate checklist

| Check                                                  | Status                                |
| ------------------------------------------------------ | ------------------------------------- |
| Callback boundaries implemented under `/api/scheduled` | Complete locally; disabled            |
| Cron-only authentication verified                      | Complete in contract tests            |
| Idempotency and retry behavior verified                | Complete for disabled response        |
| Checkpoint published                                   | Pending; current build is unpublished |
| Provider credentials configured                        | Pending; depends on delivery channel  |
| Production schedule created and enabled                | Pending; do not activate yet          |

## Final provider posture during validation

The current validated posture is **Twilio-only live phone OTP** with `AUTH_MODE=production` and `AUTH_OTP_MODE=production`. Email verification and password-reset delivery remain on the safe mock provider through `AUTH_EMAIL_MODE=mock`; Resend live delivery is not retried or enabled until an active API key and verified sender are configured. The Heartbeat reminder and streak-alert callbacks remain disabled during this validation period, and no live schedule activation is performed from the application.
