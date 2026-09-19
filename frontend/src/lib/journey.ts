import { useCallback, useEffect, useState } from "react";
import { emptyJourney, type JourneyState } from "./types";

const KEY = "yaduk.journey.v1";
const LEGACY_KEY_SARTHI = "sarthi.journey.v1";
const LEGACY_KEY_QUESTLINE = "questline.journey.v1";

export function useJourney() {
  const [state, setState] = useState<JourneyState>(emptyJourney);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(KEY) ||
        window.localStorage.getItem(LEGACY_KEY_SARTHI) ||
        window.localStorage.getItem(LEGACY_KEY_QUESTLINE);
      if (raw) setState({ ...emptyJourney, ...(JSON.parse(raw) as JourneyState) });
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);

    const onSessionCleared = () => {
      setState(emptyJourney);
      try {
        window.localStorage.removeItem(KEY);
        window.localStorage.removeItem(LEGACY_KEY_SARTHI);
        window.localStorage.removeItem(LEGACY_KEY_QUESTLINE);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("yaduk:session_cleared", onSessionCleared);
    window.addEventListener("sarthi:session_cleared", onSessionCleared);
    return () => {
      window.removeEventListener("yaduk:session_cleared", onSessionCleared);
      window.removeEventListener("sarthi:session_cleared", onSessionCleared);
    };
  }, []);

  const update = useCallback((patch: Partial<JourneyState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage full or blocked */
      }
      return next;
    });
  }, []);

  const award = useCallback(
    (xp: number, badge?: string) => {
      setState((prev) => {
        const next: JourneyState = {
          ...prev,
          xp: prev.xp + xp,
          badges: badge && !prev.badges.includes(badge) ? [...prev.badges, badge] : prev.badges,
        };
        try {
          window.localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
      window.localStorage.removeItem(LEGACY_KEY_SARTHI);
      window.localStorage.removeItem(LEGACY_KEY_QUESTLINE);
    } catch {
      /* ignore */
    }
    setState(emptyJourney);
  }, []);

  return { state, update, award, reset, hydrated };
}
