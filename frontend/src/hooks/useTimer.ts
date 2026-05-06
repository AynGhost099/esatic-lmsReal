import { useState, useEffect, useRef } from "react";

export function useTimer(initialSeconds: number, onExpire?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds((s) => s - 1), 1000);
    } else if (seconds === 0 && isRunning) {
      setIsRunning(false);
      onExpire?.();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, seconds]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => { stop(); setSeconds(initialSeconds); };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const percentage = (seconds / initialSeconds) * 100;

  return { seconds, display, percentage, isRunning, start, stop, reset };
}
