export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatScore(score, total) {
  return `${score}/${total}`;
}

export function getGrade(percentage) {
  if (percentage >= 90) return { grade: 'A+', color: 'var(--accent)' };
  if (percentage >= 80) return { grade: 'A',  color: 'var(--accent)' };
  if (percentage >= 70) return { grade: 'B+', color: 'var(--info)' };
  if (percentage >= 60) return { grade: 'B',  color: 'var(--info)' };
  if (percentage >= 50) return { grade: 'C',  color: 'var(--warning)' };
  if (percentage >= 40) return { grade: 'D',  color: 'var(--warning)' };
  return { grade: 'F', color: 'var(--danger)' };
}

export function getSeverityColor(severity) {
  switch (severity) {
    case 'low':      return 'var(--accent)';
    case 'warning':  return 'var(--warning)';
    case 'danger':   return '#F97316';
    case 'critical': return 'var(--danger)';
    default:         return 'var(--text-muted)';
  }
}

export function getSeverityBg(severity) {
  switch (severity) {
    case 'low':      return 'rgba(34,197,94,0.12)';
    case 'warning':  return 'rgba(245,158,11,0.12)';
    case 'danger':   return 'rgba(249,115,22,0.12)';
    case 'critical': return 'rgba(239,68,68,0.12)';
    default:         return 'rgba(100,116,139,0.12)';
  }
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getCurrentDateTime() {
  return new Date().toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
