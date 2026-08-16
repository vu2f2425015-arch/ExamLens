import { useState, useEffect, useRef } from 'react';

export function useTimer(initialSeconds, onExpire) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isRunning || seconds <= 0) {
      if (seconds <= 0 && onExpire) onExpire();
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const pause  = () => setIsRunning(false);
  const resume = () => setIsRunning(true);
  const reset  = (s) => { setSeconds(s); setIsRunning(true); };

  const hours   = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs    = seconds % 60;
  const formatted = hours > 0
    ? `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
    : `${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

  const percentRemaining = Math.round((seconds / initialSeconds) * 100);
  const isLow    = seconds < 300 && seconds > 0;   // < 5 min
  const isCritical = seconds < 60 && seconds > 0;  // < 1 min

  return { seconds, formatted, percentRemaining, isRunning, isLow, isCritical, pause, resume, reset };
}
