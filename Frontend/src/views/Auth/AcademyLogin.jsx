import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { HUDLabel, LEDIndicator } from "../../components/background/HUD";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { notify } from "../../lib/notify";

const AcademyLogin = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = emailId.trim();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      notify("Academy login successful", "success");
      navigate("/homepage");
      return;
    }
    if (result.needsVerification) {
      setError(
        result.message ||
          "Please verify your email before signing in. Check your inbox for an OTP.",
      );
      return;
    }
    setError(result.message || "Login failed");
    notify(result.message || "Login failed", "error");
  };

  const handleGoogleCredential = useCallback(
    async (credential) => {
      setSubmitting(true);
      setError(null);
      const result = await loginWithGoogle(credential);
      setSubmitting(false);
      if (result.success) {
        notify("Signed in with Google", "success");
        navigate("/homepage");
        return;
      }
      setError(result.message || "Google sign-in failed");
      notify(result.message || "Google sign-in failed", "error");
    },
    [loginWithGoogle, navigate],
  );

  const handleGoogleError = useCallback((message) => {
    setError(message);
  }, []);

  const busy = submitting || isLoading;

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden flex flex-col font-sans selection:bg-[#17E1FF] selection:text-black ${
        isDarkMode ? "bg-[#0B0E11] text-white" : "bg-[#F4F5F3] text-[#0B0E11]"
      }`}
    >
      <header className="relative z-50 p-6 md:p-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <LEDIndicator status="online" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">
            Academy Access
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="font-mono text-[10px] tracking-widest uppercase opacity-60 hover:opacity-100"
        >
          Team Collaboration Login →
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
            Academy Sign In
          </h1>
          <p
            className={`text-sm mb-8 ${
              isDarkMode ? "text-white/50" : "text-[#0B0E11]/60"
            }`}
          >
            DSA practice, contests, AI mentor, and progress — individual
            account.
          </p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                Email
              </span>
              <input
                type="email"
                autoComplete="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                disabled={busy}
                className={`mt-2 w-full rounded-xl border bg-transparent px-4 py-3 outline-none focus:border-[#17E1FF] ${
                  isDarkMode ? "border-white/15" : "border-[#0B0E11]/15"
                }`}
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                Password
              </span>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  className={`w-full rounded-xl border bg-transparent px-4 py-3 pr-12 outline-none focus:border-[#17E1FF] ${
                    isDarkMode ? "border-white/15" : "border-[#0B0E11]/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="group w-full h-12 rounded-full border border-[#17E1FF]/40 bg-[#17E1FF]/10 font-bold uppercase tracking-widest text-sm hover:bg-[#17E1FF] hover:text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy ? "Signing in…" : "Sign In"}
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
            onError={handleGoogleError}
            disabled={busy}
            text="signin_with"
          />

          <div className="mt-8 space-y-2 text-sm">
            <p className={isDarkMode ? "text-white/45" : "text-[#0B0E11]/55"}>
              New to Academy?{" "}
              <button
                type="button"
                onClick={() => navigate("/academy/register")}
                className="underline text-[#17E1FF]"
              >
                Create account
              </button>
            </p>
            <p className={isDarkMode ? "text-white/45" : "text-[#0B0E11]/55"}>
              Forgot password?{" "}
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="underline text-[#17E1FF]"
              >
                Reset
              </button>
            </p>
          </div>

          <div className="mt-8 flex gap-6">
            <HUDLabel label="DOMAIN" value="ACADEMY" />
            <HUDLabel label="TOKEN" value="USER JWT" />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AcademyLogin;
