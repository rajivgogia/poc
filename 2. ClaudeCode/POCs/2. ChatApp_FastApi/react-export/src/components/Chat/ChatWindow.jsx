import { useChat } from '../../hooks/useChat.js';
import { IconX } from '../../icons.jsx';
import { EmptyState } from '../common/EmptyState.jsx';
import { ChatMessages } from './ChatMessages.jsx';
import { ChatInput } from './ChatInput.jsx';
import { THEMES } from '../../data.js';

const THEME_KEYS = Object.keys(THEMES);

export function ChatWindow({ currentTheme, onThemeChange }) {
  const { state, clearError } = useChat();
  const { sessions, activeSessionId, histories, isSending, error } = state;

  function cycleTheme() {
    const idx = THEME_KEYS.indexOf(currentTheme);
    onThemeChange(THEME_KEYS[(idx + 1) % THEME_KEYS.length]);
  }

  if (!activeSessionId) {
    return (
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        <EmptyState />
      </main>
    );
  }

  const session = sessions.find((s) => s.id === activeSessionId);
  const history = histories[activeSessionId] ?? [];

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
      <header
        style={{
          minHeight: 64,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 24px',
          background: 'var(--panel)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 10,
              height: 10,
              flexShrink: 0,
              borderRadius: '50%',
              background: 'var(--accent)',
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 16,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {session?.name ?? 'Chat'}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--sub)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              AI Chat
            </div>
          </div>
        </div>

        {currentTheme && (
          <button
            onClick={cycleTheme}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: 999,
              border: 'none',
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              fontSize: 12.5,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {currentTheme}
          </button>
        )}
      </header>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            background: '#FEE2E2',
            borderBottom: '1px solid #FECACA',
            color: '#991B1B',
            fontSize: 13.5,
          }}
        >
          <span style={{ flex: 1 }}>{error.message}</span>
          {error.retryAction && (
            <button
              onClick={error.retryAction}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: '1px solid #F87171',
                background: 'transparent',
                color: '#991B1B',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          )}
          <button
            onClick={clearError}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#991B1B', display: 'grid', placeItems: 'center', padding: 4 }}
          >
            <IconX />
          </button>
        </div>
      )}

      <ChatMessages history={history} isSending={isSending} />
      <ChatInput />
    </main>
  );
}
