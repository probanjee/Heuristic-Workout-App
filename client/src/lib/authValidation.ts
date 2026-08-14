export function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

export function isValidPassword(password: string) {
  return password.length >= 8;
}

export function isValidInternationalPhone(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone.trim());
}

export function isValidOtp(otp: string) {
  return /^\d{6}$/.test(otp);
}
