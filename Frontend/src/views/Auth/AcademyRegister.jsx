import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { HUDLabel } from "../../components/background/HUD";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { notify } from "../../lib/notify";

const AcademyRegister = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState({
    firstName: "",
    emailId: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const firstName = form.firstName.trim();
    const emailId = form.emailId.trim();
    if (!firstName || firstName.length < 3) {
      setError("First name must be at least 3 characters.");
      return;
    }
    if (!emailId || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await register({
      firstName,
      emailId,
      password: form.password,
      confirmPassword: form.confirmPassword,
    });
    setSubmitting(false);

    if (result.success) {
      notify(
        "Account created. Please verify your email if prompted.",
        "success",
      );
      navigate("/homepage");
      return;
    }
    setError(result.message || "Registration failed");
    notify(result.message || "Registration failed", "error");
  };

  const handleGoogleCredential = useCallback(
    async (credential) => {
      setSubmitting(true);
      setError(null);
      const result = await loginWithGoogle(credential);
      setSubmitting(false);
      if (result.success) {
        notify("Registered with Google", "success");
        navigate("/homepage");
        return;
      }
      setError(result.message || "Google registration failed");
      notify(result.message || "Google registration failed", "error");
    },
    [loginWithGoogle, navigate],
  );

  const busy = submitting || isLoading;

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden flex flex-col font-sans ${
        isDarkMode ? "bg-[#0B0E11] text-white" : "bg-[#F4F5F3] text-[#0B0E11]"
      }`}
    >
      <header className="relative z-50 p-6 md:p-8 flex justify-between items-center">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">
          Academy Registration
        </span>
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="font-mono text-[10px] tracking-widest uppercase opacity-60 hover:opacity-100"
        >
          Team Registration →
        </button>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md rounded-2xl border p-8 ${
            isDarkMode
              ? "border-white/10 bg-white/[0.03]"
              : "border-[#0B0E11]/10 bg-white"
          }`}
        >
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Create Academy Account
          </h1>
          <p
            className={`text-sm mb-8 ${
              isDarkMode ? "text-white/50" : "text-[#0B0E11]/60"
            }`}
          >
            Separate from Team collaboration accounts.
          </p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "firstName", label: "First name", type: "text" },
              { key: "emailId", label: "Email", type: "email" },
            ].map(({ key, label, type }) => (
              <label key={key} className="block">
                <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                  {label}
                </span>
                <input
                  type={type}
                  value={form[key]}
                  onChange={onChange(key)}
                  disabled={busy}
                  className={`mt-2 w-full rounded-xl border bg-transparent px-4 py-3 outline-none focus:border-[#17E1FF] ${
                    isDarkMode ? "border-white/15" : "border-[#0B0E11]/15"
                  }`}
                />
              </label>
            ))}

            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                Password
              </span>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={onChange("password")}
                  disabled={busy}
                  className={`w-full rounded-xl border bg-transparent px-4 py-3 pr-12 outline-none focus:border-[#17E1FF] ${
                    isDarkMode ? "border-white/15" : "border-[#0B0E11]/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                Confirm password
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={onChange("confirmPassword")}
                disabled={busy}
                className={`mt-2 w-full rounded-xl border bg-transparent px-4 py-3 outline-none focus:border-[#17E1FF] ${
                  isDarkMode ? "border-white/15" : "border-[#0B0E11]/15"
                }`}
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="group w-full h-12 rounded-full border border-[#17E1FF]/40 bg-[#17E1FF]/10 font-bold uppercase tracking-widest text-sm hover:bg-[#17E1FF] hover:text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy ? "Creating…" : "Create Account"}
              {!busy && <ChevronRight size={16} />}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div
              className={`h-px flex-1 ${isDarkMode ? "bg-white/10" : "bg-black/10"}`}
            />
            <span className="font-mono text-[10px] uppercase opacity-40">
              or
            </span>
            <div
              className={`h-px flex-1 ${isDarkMode ? "bg-white/10" : "bg-black/10"}`}
            />
          </div>

          <GoogleSignInButton
            onCredential={handleGoogleCredential}
            onError={setError}
            disabled={busy}
            text="signup_with"
          />

          <p
            className={`mt-8 text-sm ${
              isDarkMode ? "text-white/45" : "text-[#0B0E11]/55"
            }`}
          >
            Already have an Academy account?{" "}
            <button
              type="button"
              onClick={() => navigate("/academy/login")}
              className="underline text-[#17E1FF]"
            >
              Sign in
            </button>
          </p>

          <div className="mt-8">
            <HUDLabel label="DOMAIN" value="ACADEMY" />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AcademyRegister;
