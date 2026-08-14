import { describe, expect, it } from "vitest";
import { getOnboardingProfileState } from "./onboardingState";

describe("getOnboardingProfileState", () => {
  it("starts a new user at the first onboarding step when profile data is null", () => {
    expect(getOnboardingProfileState(null)).toEqual({
      step: 0,
      hasProfile: false,
    });
    expect(getOnboardingProfileState(undefined)).toEqual({
      step: 0,
      hasProfile: false,
    });
  });

  it("clamps persisted progress to the final onboarding step", () => {
    expect(getOnboardingProfileState({ onboardingStep: 4 })).toEqual({
      step: 4,
      hasProfile: true,
    });
    expect(getOnboardingProfileState({ onboardingStep: 99 })).toEqual({
      step: 7,
      hasProfile: true,
    });
  });
});
