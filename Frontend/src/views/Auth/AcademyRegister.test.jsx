import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const register = vi.fn();
const loginWithGoogle = vi.fn();
const navigate = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    register,
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
  default: () => <button type="button">Mock Google</button>,
}));

vi.mock("../../components/background/HUD", () => ({
  HUDLabel: () => null,
  LEDIndicator: () => null,
}));

import AcademyRegister from "./AcademyRegister";

describe("AcademyRegister", () => {
  beforeEach(() => {
    register.mockReset();
    loginWithGoogle.mockReset();
    navigate.mockReset();
  });

  it("requires matching passwords", async () => {
    render(
      <MemoryRouter>
        <AcademyRegister />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "different" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account|sign up|register/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("submits register payload on success", async () => {
    register.mockResolvedValue({ success: true });
    render(
      <MemoryRouter>
        <AcademyRegister />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account|sign up|register/i }));
    await waitFor(() =>
      expect(register).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "Ada",
          emailId: "ada@example.com",
        }),
      ),
    );
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/homepage"));
  });
});
