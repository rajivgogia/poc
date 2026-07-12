import { useEffect, useRef, useState } from 'react';
import { IconSend } from '../../icons.jsx';
import { useChat } from '../../hooks/useChat.js';

export function ChatInput() {
  const { state, sendChatMessage } = useChat();
  const { isSending } = state;
  const [draft, setDraft] = useState('');
  const textareaRef = useRef(null);

  const canSend = draft.trim().length > 0 && !isSending;

  function handleSend() {
    if (!canSend) return;
    const text = draft.trim();
    setDraft('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    sendChatMessage(text);
  }

  function handleChange(e) {
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  useEffect(() => {
    if (!isSending && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isSending]);

  return (
    <footer style={{ flexShrink: 0, padding: '12px 20px 18px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          padding: '8px 8px 8px 14px',
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 16,
        }}
      >
        <textarea
          ref={textareaRef}
          value={draft}
          rows={1}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message AI…"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 14.5,
            color: 'var(--text)',
            padding: '8px 0',
            resize: 'none',
            overflow: 'hidden',
            lineHeight: 1.5,
            fontFamily: 'inherit',
            maxHeight: 200,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          title="Send"
          style={{
            width: 36,
            height: 36,
            flexShrink: 0,
            border: 'none',
            borderRadius: 11,
            background: canSend ? 'var(--accent)' : 'var(--panel2)',
            color: canSend ? 'var(--on-accent)' : 'var(--sub)',
            cursor: canSend ? 'pointer' : 'default',
            display: 'grid',
            placeItems: 'center',
            transition: 'background .15s',
          }}
        >
          <IconSend />
        </button>
      </div>
    </footer>
  );
}
