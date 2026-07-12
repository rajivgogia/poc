import { useChat } from '../../hooks/useChat.js';
import { SessionItem } from './SessionItem.jsx';

export function SessionList() {
  const { state, selectSession, deleteSession } = useChat();
  const { sessions, activeSessionId } = state;

  if (sessions.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontSize: 13,
          color: 'var(--sub)',
          textAlign: 'center',
        }}
      >
        No conversations yet
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '4px 8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {sessions.map((session) => (
        <SessionItem
          key={session.id}
          session={session}
          isActive={session.id === activeSessionId}
          onSelect={selectSession}
          onDelete={deleteSession}
        />
      ))}
    </div>
  );
}
