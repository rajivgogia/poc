import { useEffect, useReducer, useRef } from 'react';
import { ChatContext } from './ChatContext.jsx';
import * as api from '../services/api.js';

const STORAGE_KEY = 'travel_state';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { sessions, activeSessionId, histories } = JSON.parse(raw);
    return { sessions: sessions ?? [], activeSessionId: activeSessionId ?? null, histories: histories ?? {} };
  } catch {
    return null;
  }
}

function initialState() {
  const saved = loadState();
  return {
    sessions: saved?.sessions ?? [],
    activeSessionId: saved?.activeSessionId ?? null,
    histories: saved?.histories ?? {},
    isSending: false,
    error: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SESSION_CREATED': {
      const { session } = action.payload;
      return {
        ...state,
        sessions: [session, ...state.sessions],
        activeSessionId: session.id,
        histories: { ...state.histories, [session.id]: [] },
        error: null,
      };
    }
    case 'SESSION_SELECTED':
      return { ...state, activeSessionId: action.payload.sessionId, error: null };

    case 'SESSION_DELETED': {
      const { sessionId } = action.payload;
      const sessions = state.sessions.filter((s) => s.id !== sessionId);
      const histories = { ...state.histories };
      delete histories[sessionId];
      const activeSessionId =
        state.activeSessionId === sessionId
          ? (sessions[0]?.id ?? null)
          : state.activeSessionId;
      return { ...state, sessions, histories, activeSessionId };
    }

    case 'SESSION_RENAMED': {
      const { sessionId, name } = action.payload;
      return {
        ...state,
        sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, name } : s)),
      };
    }

    case 'MESSAGE_SENT': {
      const { sessionId, content } = action.payload;
      const prev = state.histories[sessionId] ?? [];
      return {
        ...state,
        histories: {
          ...state.histories,
          [sessionId]: [...prev, { role: 'user', content }],
        },
      };
    }

    case 'REPLY_RECEIVED': {
      const { sessionId, history } = action.payload;
      return {
        ...state,
        histories: { ...state.histories, [sessionId]: history },
      };
    }

    case 'SEND_START':
      return { ...state, isSending: true };

    case 'SEND_END':
      return { ...state, isSending: false };

    case 'ERROR_SET':
      return { ...state, error: action.payload };

    case 'ERROR_CLEAR':
      return { ...state, error: null };

    default:
      return state;
  }
}

// Provides to the same ChatContext so all existing components (Sidebar, ChatWindow, etc.)
// work unchanged — sessions and histories are fully isolated because this is a separate
// useReducer instance that only lives while the Travel tab is mounted.
export function TravelProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const sessionCount = useRef(state.sessions.length);

  useEffect(() => {
    const { sessions, activeSessionId, histories } = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions, activeSessionId, histories }));
    } catch { /* storage quota exceeded — silently skip */ }
  }, [state]);

  async function createNewSession() {
    try {
      const data = await api.createTravelSession();
      sessionCount.current += 1;
      const session = {
        id: data.session_id,
        name: `New Trip #${sessionCount.current}`,
        createdAt: Date.now(),
      };
      dispatch({ type: 'SESSION_CREATED', payload: { session } });
    } catch (err) {
      dispatch({
        type: 'ERROR_SET',
        payload: { message: `Failed to create trip: ${err.message}`, retryAction: createNewSession },
      });
    }
  }

  function selectSession(sessionId) {
    dispatch({ type: 'SESSION_SELECTED', payload: { sessionId } });
  }

  async function sendChatMessage(message) {
    const { activeSessionId, isSending, histories } = state;
    if (!activeSessionId || isSending) return;

    const currentHistory = histories[activeSessionId] ?? [];
    const isFirstUserMessage = !currentHistory.some((m) => m.role === 'user');
    if (isFirstUserMessage) {
      dispatch({
        type: 'SESSION_RENAMED',
        payload: { sessionId: activeSessionId, name: message.slice(0, 50) },
      });
    }

    dispatch({ type: 'MESSAGE_SENT', payload: { sessionId: activeSessionId, content: message } });
    dispatch({ type: 'SEND_START' });

    try {
      const data = await api.sendMessage(activeSessionId, message);
      dispatch({ type: 'REPLY_RECEIVED', payload: { sessionId: activeSessionId, history: data.history } });
    } catch (err) {
      dispatch({
        type: 'ERROR_SET',
        payload: {
          message: `Failed to send message: ${err.message}`,
          retryAction: () => sendChatMessage(message),
        },
      });
    } finally {
      dispatch({ type: 'SEND_END' });
    }
  }

  async function deleteSession(sessionId) {
    dispatch({ type: 'SESSION_DELETED', payload: { sessionId } });
    try {
      await api.deleteSession(sessionId);
    } catch {
      // best-effort
    }
  }

  function clearError() {
    dispatch({ type: 'ERROR_CLEAR' });
  }

  return (
    <ChatContext.Provider value={{ state, createNewSession, selectSession, sendChatMessage, deleteSession, clearError }}>
      {children}
    </ChatContext.Provider>
  );
}
