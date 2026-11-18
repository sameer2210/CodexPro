/**
 * useToast — compatibility shim wrapping the project's `notify` util (Sonner).
 * Several components import this hook; this file makes them compile and work
 * without changing their call sites.
 */
import { notify } from "../lib/notify";

export const useToast = () => {
  const showToast = (message, type = "info") => notify(message, type);

  return {
    showToast,
    success: (msg) => notify(msg, "success"),
    error: (msg) => notify(msg, "error"),
    warning: (msg) => notify(msg, "warning"),
    info: (msg) => notify(msg, "info"),
  };
};

export default useToast;
