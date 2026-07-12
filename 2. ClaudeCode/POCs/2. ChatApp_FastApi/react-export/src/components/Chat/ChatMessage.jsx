export function ChatMessage({ role, content }) {
  const isUser = role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        animation: 'msgIn .18s ease',
      }}
    >
      <div
        style={{
          maxWidth: '68%',
          padding: '9px 14px',
          fontSize: 14.5,
          lineHeight: 1.5,
          borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
          background: isUser ? 'var(--accent)' : 'var(--bubble)',
          color: isUser ? 'var(--on-accent)' : 'var(--text)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {content}
      </div>
    </div>
  );
}
