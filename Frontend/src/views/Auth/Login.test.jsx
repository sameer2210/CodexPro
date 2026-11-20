import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const dispatch = vi.fn();
const navigate = vi.fn();

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (sel) =>
    sel({
      auth: { isLoading: false, error: null, isAuthenticated: false },
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
    useLocation: () => ({ pathname: "/login" }),
  };
});

vi.mock("../../components/background/HUD", () => ({
  HUDLabel: () => null,
  LEDIndicator: () => null,
}));

vi.mock("../../store/slices/authSlice", () => ({
  loginUser: Object.assign(
    (payload) => ({ type: "auth/loginUser", payload }),
    {
      fulfilled: { match: () => false },
      rejected: { match: () => false },
      pending: { match: () => false },
    },
  ),
  clearError: () => ({ type: "auth/clearError" }),
}));

import Login from "./Login";

describe("Team Login", () => {
  beforeEach(() => {
    dispatch.mockReset();
    navigate.mockReset();
  });

  it("renders without crashing (motion import regression)", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    expect(screen.getByText(/enter your team name/i)).toBeTruthy();
  });

  it("validates required team fields before dispatching login", async () => {
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    // fireEvent.submit bypasses HTML5 `required` so app-level validation runs
    fireEvent.submit(container.querySelector("form"));
    expect(
      await screen.findByText(/please complete all required fields/i),
    ).toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "auth/loginUser" }),
    );
  });
});

