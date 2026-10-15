import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { bankReducer, initialState, type Action, type BankState } from "./bank";

type Ctx = {
  state: BankState;
  dispatch: (a: Action) => void;
  /** Read a message to screen readers through the polite live region */
  announce: (message: string) => void;
  /** User's own choice to use the flat piggy bank instead of 3D */
  flat: boolean;
  setFlat: (flat: boolean) => void;
};

const BankContext = createContext<Ctx | null>(null);

function readFlat() {
  try {
    return localStorage.getItem("digibank:flat") === "1";
  } catch {
    return false;
  }
}

export function BankProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bankReducer, initialState);
  const [message, setMessage] = useState("");
  const [flat, setFlatState] = useState(readFlat);
  const tick = useRef(0);

  const announce = useCallback((text: string) => {
    // A trailing zero-width change makes repeated messages read again
    tick.current += 1;
    setMessage(text + (tick.current % 2 ? "" : "​"));
  }, []);

  const setFlat = useCallback((value: boolean) => {
    setFlatState(value);
    try {
      localStorage.setItem("digibank:flat", value ? "1" : "0");
    } catch {
      /* private mode: keep it for this visit only */
    }
  }, []);

  const value = useMemo(() => ({ state, dispatch, announce, flat, setFlat }), [state, announce, flat, setFlat]);

  return (
    <BankContext.Provider value={value}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </BankContext.Provider>
  );
}

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error("useBank outside BankProvider");
  return ctx;
}
