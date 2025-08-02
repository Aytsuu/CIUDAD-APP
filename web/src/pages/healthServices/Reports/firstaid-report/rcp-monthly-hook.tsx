// src/hooks/useMonthlyReportState.ts
import { useState, useEffect } from 'react';
import { useLocation, useNavigate,To } from 'react-router-dom';

export function useMonthlyReportState() {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState(location.state);

  useEffect(() => {
    if (location.state) {
      setState(location.state);
    }
  }, [location]);

  const updateAndNavigate = (updatedState: any) => {
    navigate(-1 as To, { state: updatedState, replace: true });
  };

  return { state, updateAndNavigate };
}