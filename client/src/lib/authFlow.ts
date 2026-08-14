export type SignupDeliveryMethod = "email" | "phone";

export function verificationChannel(method: SignupDeliveryMethod) {
  return method === "email" ? "email_otp" : "phone_otp";
}

export function verificationCopy(method: SignupDeliveryMethod) {
  return method === "email"
    ? "Enter the 6-digit code sent to your email address."
    : "Enter the 6-digit code sent to your mobile number.";
}
