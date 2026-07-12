import { IconPlus } from '../../icons.jsx';
import { useChat } from '../../hooks/useChat.js';
import { SessionList } from './SessionList.jsx';
import { THEMES } from '../../data.js';

export function Sidebar({ currentTheme, onThemeChange }) {
  const { createNewSession } = useChat();

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        background: 'var(--panel)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: '18px 16px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          AI Chat
        </h1>
        <button
          onClick={createNewSession}
          title="New Chat"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            border: 'none',
            borderRadius: 9,
            background: 'var(--accent)',
            color: 'var(--on-accent)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <IconPlus />
          New Chat
        </button>
      </div>

      <SessionList />

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <label style={{ fontSize: 12, color: 'var(--sub)', flexShrink: 0 }}>Theme</label>
        <select
          value={currentTheme}
          onChange={(e) => onThemeChange(e.target.value)}
          style={{
            flex: 1,
            fontSize: 12,
            padding: '4px 6px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--panel2)',
            color: 'var(--text)',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {Object.keys(THEMES).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
