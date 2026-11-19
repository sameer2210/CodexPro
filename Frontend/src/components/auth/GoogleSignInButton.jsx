import { useEffect, useRef, useState } from "react";

const GIS_SCRIPT_ID = "google-identity-services";
const GIS_SRC = "https://accounts.google.com/gsi/client";

let scriptLoadPromise = null;

const loadGisScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(GIS_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services")),
      );
      return;
    }
    const script = document.createElement("script");
    script.id = GIS_SCRIPT_ID;
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
};

/**
 * Google Identity Services button (Academy auth only).
 * Sends the ID token credential to the parent via onCredential.
 */
const GoogleSignInButton = ({
  onCredential,
  onError,
  disabled = false,
  text = "continue_with",
}) => {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [configError, setConfigError] = useState(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!clientId) {
        setConfigError("Google Sign-In is not configured.");
        return;
      }
      try {
        await loadGisScript();
        if (cancelled || !window.google?.accounts?.id || !buttonRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response?.credential) {
              onError?.("Google did not return a credential.");
              return;
            }
            onCredential?.(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          width: 320,
        });
        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) {
          setConfigError(err.message || "Google Sign-In unavailable");
          onError?.(err.message || "Google Sign-In unavailable");
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential, onError, text]);

  if (configError) {
    return (
      <p className="text-center text-xs font-mono text-white/40">{configError}</p>
    );
  }

  return (
    <div
      className={`flex justify-center min-h-[44px] ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
      aria-busy={!ready}
    >
      <div ref={buttonRef} />
    </div>
  );
};

export default GoogleSignInButton;
