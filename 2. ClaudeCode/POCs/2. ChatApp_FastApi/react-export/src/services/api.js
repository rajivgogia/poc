const BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${res.status} from ${path}`);
  }
  return res.json();
}

export function createSession({ systemPrompt, model } = {}) {
  const body = {};
  if (systemPrompt) body.system_prompt = systemPrompt;
  if (model) body.model = model;
  return request('/chat/start', { method: 'POST', body: JSON.stringify(body) });
}

export function sendMessage(sessionId, message) {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, message }),
  });
}

export function getHistory(sessionId) {
  return request(`/chat/${sessionId}/history`);
}

export function deleteSession(sessionId) {
  return request(`/chat/${sessionId}`, { method: 'DELETE' });
}
