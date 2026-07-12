import { IconChat } from '../../icons.jsx';
import { useChat } from '../../hooks/useChat.js';

export function EmptyState({ newLabel = 'New Chat' }) {
  const { createNewSession } = useChat();

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        color: 'var(--sub)',
        padding: 32,
      }}
    >
      <IconChat width={48} height={48} style={{ opacity: 0.4 }} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text)' }}>
          Start a new conversation
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--sub)' }}>
          Click &ldquo;{newLabel}&rdquo; to begin
        </p>
      </div>
      <button
        onClick={createNewSession}
        style={{
          marginTop: 8,
          padding: '10px 20px',
          borderRadius: 10,
          border: 'none',
          background: 'var(--accent)',
          color: 'var(--on-accent)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {newLabel}
      </button>
    </div>
  );
}
