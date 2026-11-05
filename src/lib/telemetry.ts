export function trackActivity(eventType: string, metadata?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    let sessionId: string | undefined;
    try {
      sessionId = sessionStorage.getItem('art_session_id') || undefined;
      if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('art_session_id', sessionId);
      }
    } catch {
      // Ignore storage access errors
    }

    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        sessionId,
        metadata,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Non-blocking telemetry
  }
}
