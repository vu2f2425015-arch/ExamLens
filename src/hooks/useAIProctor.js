import { useState, useEffect, useCallback, useRef } from 'react';

const AI_EVENTS = [
  { type: 'Face Verified',          severity: 'low',      icon: '✅' },
  { type: 'Looking Away',           severity: 'warning',  icon: '👀' },
  { type: 'Face Lost',              severity: 'warning',  icon: '😶' },
  { type: 'Multiple Faces Detected',severity: 'critical', icon: '👥' },
  { type: 'Phone Detected',         severity: 'danger',   icon: '📱' },
  { type: 'Background Noise',       severity: 'warning',  icon: '🔊' },
  { type: 'Tab Switch Attempt',     severity: 'danger',   icon: '🔄' },
  { type: 'Fullscreen Exited',      severity: 'danger',   icon: '⛶' },
  { type: 'Low Light Detected',     severity: 'warning',  icon: '🌑' },
  { type: 'Camera Blocked',         severity: 'critical', icon: '📷' },
];

// Weighted pool — positive events appear more often
const EVENT_POOL = [
  ...Array(6).fill(AI_EVENTS[0]),  // Face Verified (most common)
  AI_EVENTS[1],
  AI_EVENTS[1],
  AI_EVENTS[2],
  AI_EVENTS[3],
  AI_EVENTS[4],
  AI_EVENTS[5],
  AI_EVENTS[6],
  AI_EVENTS[7],
  AI_EVENTS[8],
  AI_EVENTS[9],
];

export function useAIProctor({ active = true, sensitivity = 'medium' } = {}) {
  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), type: 'Face Verified', severity: 'low', icon: '✅' },
  ]);
  const [currentStatus, setCurrentStatus] = useState('NORMAL');
  const [violationCount, setViolationCount] = useState(0);
  const [latestAlert, setLatestAlert] = useState(null);
  const intervalRef = useRef(null);

  const intervals = { low: 8000, medium: 5000, high: 3000 };
  const intervalMs = intervals[sensitivity] || 5000;

  const addEvent = useCallback((event) => {
    const log = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      ...event,
    };
    setLogs(prev => [log, ...prev].slice(0, 50));

    if (event.severity === 'warning' || event.severity === 'danger') {
      setCurrentStatus('WARNING');
      setLatestAlert(log);
      setTimeout(() => setCurrentStatus('NORMAL'), 4000);
    }
    if (event.severity === 'critical') {
      setCurrentStatus('CRITICAL');
      setViolationCount(v => v + 1);
      setLatestAlert(log);
      setTimeout(() => setCurrentStatus('WARNING'), 6000);
      setTimeout(() => setCurrentStatus('NORMAL'), 10000);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      const event = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
      addEvent(event);
    }, intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [active, intervalMs, addEvent]);

  const clearLatestAlert = () => setLatestAlert(null);

  return { logs, currentStatus, violationCount, latestAlert, clearLatestAlert, addEvent };
}
