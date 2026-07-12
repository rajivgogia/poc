import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage.jsx';
import { LoadingIndicator } from '../common/LoadingIndicator.jsx';

export function ChatMessages({ history, isSending }) {
  const scrollRef = useRef(null);
  const visible = history.filter((m) => m.role !== 'system');

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history.length, isSending]);

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 24px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minHeight: 0,
      }}
    >
      {visible.map((msg, i) => (
        <ChatMessage key={i} role={msg.role} content={msg.content} />
      ))}
      {isSending && <LoadingIndicator />}
      <div style={{ height: 12, flexShrink: 0 }} />
    </div>
  );
}
