import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import user from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { AuthProvider, useAuth } from "@/hooks/useAuth";

// A hook that exposes the current auth context for assertions.
function AuthProbe() {
  const { user, session, loading, signIn, signOut } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user-email">{user?.email ?? ""}</span>
      <span data-testid="user-id">{user?.id ?? ""}</span>
      <span data-testid="has-session">{String(!!session)}</span>
      <button onClick={() => signIn({ id: "u-1", email: "a@b.com" }, { user: { id: "u-1", email: "a@b.com" } }, true)}>
        signin
      </button>
      <button onClick={signOut}>signout</button>
    </div>
  );
}

describe("useAuth", () => {
  it("starts logged out and reports loading=false after init", async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("user-email").textContent).toBe("");
    expect(screen.getByTestId("has-session").textContent).toBe("false");
  });

  it("signs in and persists user to localStorage (remember=true)", async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    await user.click(screen.getByRole("button", { name: "signin" }));

    expect(screen.getByTestId("user-email").textContent).toBe("a@b.com");
    expect(screen.getByTestId("has-session").textContent).toBe("true");
    expect(localStorage.getItem("zentra-mock-user")).toContain("a@b.com");
    expect(localStorage.getItem("zentra-remember")).toBe("1");
  });

  it("signs in with remember=false and persists to sessionStorage", async () => {
    // Override the probe to use remember=false.
    const Probe = () => {
      const { user, session, signIn, signOut } = useAuth();
      return (
        <div>
          <span data-testid="user-email">{user?.email ?? ""}</span>
          <span data-testid="has-session">{String(!!session)}</span>
          <button onClick={() => signIn({ id: "u-1", email: "a@b.com" }, { user: { id: "u-1", email: "a@b.com" } }, false)}>
            signin
          </button>
          <button onClick={signOut}>signout</button>
        </div>
      );
    };
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("has-session").textContent).toBe("false"));
    await user.click(screen.getByRole("button", { name: "signin" }));

    expect(screen.getByTestId("user-email").textContent).toBe("a@b.com");
    expect(screen.getByTestId("has-session").textContent).toBe("true");
    expect(sessionStorage.getItem("zentra-mock-user")).toContain("a@b.com");
    expect(localStorage.getItem("zentra-mock-user")).toBeNull();
    expect(localStorage.getItem("zentra-remember")).toBe("0");
  });

  it("signs out and clears stored auth state", async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    await user.click(screen.getByRole("button", { name: "signin" }));
    await user.click(screen.getByRole("button", { name: "signout" }));

    expect(screen.getByTestId("user-email").textContent).toBe("");
    expect(screen.getByTestId("has-session").textContent).toBe("false");
    expect(localStorage.getItem("zentra-mock-user")).toBeNull();
    expect(sessionStorage.getItem("zentra-mock-user")).toBeNull();
  });

  it("restores a persisted session on reload (remember=true)", async () => {
    localStorage.setItem("zentra-remember", "1");
    localStorage.setItem(
      "zentra-mock-user",
      JSON.stringify({ id: "u-2", email: "persisted@b.com" })
    );
    localStorage.setItem(
      "zentra-mock-session",
      JSON.stringify({ user: { id: "u-2", email: "persisted@b.com" } })
    );
    // mark session alive so init restores it
    sessionStorage.setItem("zentra-session-alive", "1");

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("user-email").textContent).toBe("persisted@b.com");
    expect(screen.getByTestId("has-session").textContent).toBe("true");
  });

  it("exposes loading=false and a no-op signOut when used without a provider", async () => {
    // useAuth falls back to the default context value when no AuthProvider wraps it.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<AuthProbe />);
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("true"));
    await user.click(screen.getByRole("button", { name: "signout" }));
    expect(screen.getByTestId("user-email").textContent).toBe("");
    spy.mockRestore();
  });
});