export function getOnboardingProfileState(
  profile: { onboardingStep?: number } | null | undefined
) {
  return {
    step: Math.min(profile?.onboardingStep || 0, 7),
    hasProfile: Boolean(profile),
  };
}
