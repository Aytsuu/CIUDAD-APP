import { useNavigate, useLocation } from "react-router";

export function useSafeNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  // Safely go back with state, or fallback to a route
  const safeGoBack = (state?: Record<string, unknown>, fallbackRoute = "/") => {
    if (location.key !== "default") { // Has navigation history
      navigate(-1); // Replace to avoid adding to history
    } else {
      navigate(fallbackRoute, { state, replace: true });
    }
  };
  
  const safeNavigate = {
    back: (state?: Record<string, unknown>) => safeGoBack(state),
    backOr: (fallback: string, state?: Record<string, unknown>) => safeGoBack(state, fallback),
    backWithCurrentState: () => safeGoBack(location.state)
  };


  return { safeNavigate };
}