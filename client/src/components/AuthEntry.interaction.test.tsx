// @vitest-environment jsdom
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  fireEvent,
  getByLabelText,
  getByRole,
  queryByText,
} from "@testing-library/dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthEntry from "./AuthEntry";

const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: toastMock }));
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: new Proxy({}, { get: () => "div" }),
  useReducedMotion: () => true,
}));

const toastError = toastMock.error;

let container: HTMLDivElement;
let root: Root;
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

beforeEach(() => {
  toastError.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

describe("AuthEntry interactive behavior", () => {
  it("toggles password visibility with an accessible control", async () => {
    await act(async () => {
      root.render(React.createElement(AuthEntry));
    });

    const password = getByLabelText(container, "Password") as HTMLInputElement;
    expect(password.type).toBe("password");

    const toggle = getByRole(container, "button", { name: "Show password" });
    await act(async () => {
      fireEvent.click(toggle);
    });

    expect(password.type).toBe("text");
    expect(
      getByRole(container, "button", { name: "Hide password" })
    ).toBeTruthy();
  });

  it("reaches the phone OTP verification controls through the real phone mode", async () => {
    await act(async () => {
      root.render(
        React.createElement(AuthEntry, {
          onPhoneRequest: async () => undefined,
        })
      );
    });

    await act(async () => {
      fireEvent.click(getByRole(container, "button", { name: "Phone + OTP" }));
    });
    const phone = container.querySelector("#auth-phone") as HTMLInputElement;
    expect(phone).toBeTruthy();
    await act(async () => {
      fireEvent.input(phone, { target: { value: "+14155552671" } });
      fireEvent.submit(
        getByRole(container, "button", { name: "Send verification code" })
      );
    });

    expect(getByLabelText(container, "6-digit verification code")).toBeTruthy();
    expect(
      getByRole(container, "button", { name: "Verify and continue" })
    ).toBeTruthy();
  });

  it("renders validation feedback when signup receives invalid identity data", async () => {
    await act(async () => {
      root.render(React.createElement(AuthEntry));
    });

    await act(async () => {
      fireEvent.click(
        getByRole(container, "button", { name: "Create an account" })
      );
    });
    const submit = getByRole(container, "button", { name: "Create account" });
    await act(async () => {
      fireEvent.submit(submit);
    });

    expect(toastError).toHaveBeenCalledWith("Enter your full name.");
    expect(queryByText(container, "Create your account")).toBeTruthy();
  });
});
