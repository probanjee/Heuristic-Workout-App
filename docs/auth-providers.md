# Authentication Provider Configuration

The authentication service uses replaceable provider interfaces. The phone OTP adapter is selected through `AUTH_MODE` and can use Twilio in production. The transactional email adapter can use Resend in production. Google sign-in remains on the managed OAuth flow.

For local development, keep `AUTH_MODE=mock`. The mock adapters are intended for local validation only and must not be enabled in production. Production delivery requires these environment variables to be configured through the project secrets manager: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL`.

Credentials must never be committed to source control, returned in API responses, written to logs, or embedded in client code. Production provider activation should be performed only after the corresponding secret values are supplied and validated in the deployment environment.
