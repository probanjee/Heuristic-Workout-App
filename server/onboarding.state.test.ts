import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OnboardingProfileMarker } from "../client/src/pages/Onboarding";
import { getOnboardingProfileState } from "../client/src/lib/onboardingState";

describe("onboarding profile hydration", () => {
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

  it("renders the page marker safely for a null profile result", () => {
    const markup = renderToStaticMarkup(
      React.createElement(OnboardingProfileMarker, { profile: null })
    );
    expect(markup).toContain('data-profile-state="new"');
    expect(markup).toContain("Profile ready");
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
