import { useRef, useState } from 'react';
import { useChat } from '../../hooks/useChat.js';
import { IconX, IconWallpaper } from '../../icons.jsx';
import { EmptyState } from '../common/EmptyState.jsx';
import { ChatMessages } from './ChatMessages.jsx';
import { ChatInput } from './ChatInput.jsx';
import { THEMES, CHAT_BACKGROUNDS } from '../../data.js';

const THEME_KEYS = Object.keys(THEMES);

export function ChatWindow({ currentTheme, onThemeChange, newLabel = 'New Chat', chatBg = 'default', onChatBgChange }) {
  const { state, clearError } = useChat();
  const { sessions, activeSessionId, histories, isSending, error } = state;
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  const activeBg = CHAT_BACKGROUNDS.find((b) => b.id === chatBg) ?? CHAT_BACKGROUNDS[0];

  function cycleTheme() {
    const idx = THEME_KEYS.indexOf(currentTheme);
    onThemeChange(THEME_KEYS[(idx + 1) % THEME_KEYS.length]);
  }

  if (!activeSessionId) {
    return (
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        <EmptyState newLabel={newLabel} />
      </main>
    );
  }

  const session = sessions.find((s) => s.id === activeSessionId);
  const history = histories[activeSessionId] ?? [];

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, position: 'relative' }}>
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
          position: 'relative',
          zIndex: 10,
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => setPickerOpen((o) => !o)}
            title="Chat background"
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 34,
              height: 34,
              borderRadius: 8,
              border: pickerOpen ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
              background: pickerOpen ? 'var(--accent-soft)' : 'transparent',
              color: pickerOpen ? 'var(--accent)' : 'var(--sub)',
              cursor: 'pointer',
              transition: 'background .15s, color .15s',
            }}
          >
            <IconWallpaper />
          </button>

          {currentTheme && (
            <button
              onClick={cycleTheme}
              style={{
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
        </div>
      </header>

      {pickerOpen && (
        <div
          ref={pickerRef}
          style={{
            position: 'absolute',
            top: 64,
            right: 16,
            zIndex: 100,
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,.18)',
            width: 288,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>
              Chat Background
            </span>
            <button
              onClick={() => setPickerOpen(false)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--sub)', display: 'grid', placeItems: 'center', padding: 2 }}
            >
              <IconX />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {CHAT_BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => { onChatBgChange?.(bg.id); setPickerOpen(false); }}
                title={bg.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 4px',
                  borderRadius: 10,
                  border: chatBg === bg.id ? '2px solid var(--accent)' : '2px solid transparent',
                  background: chatBg === bg.id ? 'var(--accent-soft)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    ...(bg.preview
                      ? { background: bg.preview }
                      : { background: 'var(--bg)' }),
                  }}
                >
                  {bg.id === 'dots' && (
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#e8eff8', backgroundImage: 'radial-gradient(circle, #9ab0c8 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                  )}
                  {bg.id === 'grid' && (
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#f2f4f7', backgroundImage: 'linear-gradient(rgba(100,116,139,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.2) 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                  )}
                  {bg.id === 'diagonal' && (
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#fdf6ec', backgroundImage: 'repeating-linear-gradient(45deg, rgba(180,140,100,.2) 0px, rgba(180,140,100,.2) 1px, transparent 1px, transparent 7px)' }} />
                  )}
                  {bg.id === 'midnight' && (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #0d1b2a, #1a2f4a)' }} />
                  )}
                  {bg.id === 'ocean' && (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #0f2942, #1e6090)' }} />
                  )}
                  {bg.id === 'sunset' && (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #c8413a, #f5a623)' }} />
                  )}
                  {bg.id === 'blush' && (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #f5dde8, #fce8f3)' }} />
                  )}
                  {bg.id === 'forest' && (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #0f1f0f, #264a26)' }} />
                  )}
                  {bg.id === 'lavender' && (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #ddd8f5, #ede8fc)' }} />
                  )}
                  {bg.id === 'wa-doodle-light' && (
                    <div style={{ width: '100%', height: '100%', background: '#f0ebe3', backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><text y='14' font-size='10' fill='%23c5b8a8'>📱</text><text x='20' y='32' font-size='9' fill='%23c5b8a8'>♪</text></svg>")`, backgroundSize: '40px 40px' }} />
                  )}
                  {bg.id === 'wa-doodle-dark' && (
                    <div style={{ width: '100%', height: '100%', background: '#0d1418', backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><text y='14' font-size='10' fill='%231e2d35'>📱</text><text x='20' y='32' font-size='9' fill='%231e2d35'>♪</text></svg>")`, backgroundSize: '40px 40px' }} />
                  )}
                  {bg.id === 'wa-teal-blue' && (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a6b5a, #1a3a6b)' }} />
                  )}
                  {bg.id === 'wa-coral-purple' && (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #c0392b, #8e44ad)' }} />
                  )}
                  {bg.id === 'wa-sunrise' && (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #f7b2b7, #f9d29d)' }} />
                  )}
                  {bg.id === 'wa-ocean' && (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #00b4d8, #023e8a)' }} />
                  )}
                  {bg.id === 'wa-doodle-colour' && (
                    <div style={{ width: '100%', height: '100%', background: '#fef9f0', backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36'><text y='14' font-size='11'>🌸</text><text x='18' y='30' font-size='10'>🦋</text></svg>")`, backgroundSize: '36px 36px' }} />
                  )}
                  {bg.id === 'wa-forest' && (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg, #a8e6cf, #2d6a4f)' }} />
                  )}
                  {bg.id === 'wa-doodle-night' && (
                    <div style={{ width: '100%', height: '100%', background: '#1a1a2e', backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><text y='14' font-size='11' fill='%2328284a'>🌙</text><text x='20' y='30' font-size='9' fill='%2328284a'>⭐</text></svg>")`, backgroundSize: '40px 40px' }} />
                  )}
                </div>
                <span style={{ fontSize: 10.5, color: chatBg === bg.id ? 'var(--accent)' : 'var(--sub)', fontWeight: chatBg === bg.id ? 600 : 400, lineHeight: 1 }}>
                  {bg.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

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

      <ChatMessages history={history} isSending={isSending} backgroundStyle={activeBg.style} />
      <ChatInput />
    </main>
  );
}
