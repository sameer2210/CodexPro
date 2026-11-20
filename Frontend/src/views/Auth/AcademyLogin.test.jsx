import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const login = vi.fn();
const loginWithGoogle = vi.fn();
const navigate = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    login,
    loginWithGoogle,
    isLoading: false,
  }),
}));

vi.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({ isDarkMode: true }),
}));

vi.mock("../../lib/notify", () => ({
  notify: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("../../components/auth/GoogleSignInButton", () => ({
  default: ({ onCredential }) => (
    <button type="button" onClick={() => onCredential("mock-google-id-token")}>
      Mock Google
    </button>
  ),
}));

vi.mock("../../components/background/HUD", () => ({
  HUDLabel: () => null,
  LEDIndicator: () => null,
}));

import AcademyLogin from "./AcademyLogin";

describe("AcademyLogin", () => {
  beforeEach(() => {
    login.mockReset();
    loginWithGoogle.mockReset();
    navigate.mockReset();
  });

  it("requires email and password", async () => {
    render(
      <MemoryRouter>
        <AcademyLogin />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/email and password are required/i)).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("submits emailId/password and navigates on success", async () => {
    login.mockResolvedValue({ success: true });
    render(
      <MemoryRouter>
        <AcademyLogin />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "learner@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() =>
      expect(login).toHaveBeenCalledWith("learner@example.com", "secret123"),
    );
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/homepage"));
  });

  it("shows needsVerification message", async () => {
    login.mockResolvedValue({
      success: false,
      needsVerification: true,
      message: "Email not verified",
    });
    render(
      <MemoryRouter>
        <AcademyLogin />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "unverified@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/email not verified/i)).toBeInTheDocument();
  });

  it("handles mocked Google credential success", async () => {
    loginWithGoogle.mockResolvedValue({ success: true });
    render(
      <MemoryRouter>
        <AcademyLogin />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: /mock google/i }));
    await waitFor(() =>
      expect(loginWithGoogle).toHaveBeenCalledWith("mock-google-id-token"),
    );
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/homepage"));
  });
});
