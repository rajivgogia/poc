import { useState } from 'react';
import { IconChat, IconTrash } from '../../icons.jsx';

export function SessionItem({ session, isActive, onSelect, onDelete }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={() => onSelect(session.id)}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 12px',
          paddingRight: hover || isActive ? 36 : 12,
          border: 'none',
          borderRadius: 10,
          background: isActive ? 'var(--accent-soft)' : hover ? 'var(--panel2)' : 'transparent',
          color: isActive ? 'var(--accent)' : 'var(--text)',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          transition: 'background .12s',
          minWidth: 0,
        }}
      >
        <IconChat
          width={15}
          height={15}
          style={{ flexShrink: 0, color: isActive ? 'var(--accent)' : 'var(--sub)' }}
        />
        <span
          style={{
            flex: 1,
            fontSize: 13.5,
            fontWeight: isActive ? 600 : 400,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0,
          }}
        >
          {session.name}
        </span>
      </button>

      {(hover || isActive) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(session.id);
          }}
          title="Delete chat"
          style={{
            position: 'absolute',
            right: 8,
            width: 22,
            height: 22,
            border: 'none',
            borderRadius: 6,
            background: 'transparent',
            color: 'var(--sub)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            padding: 0,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--sub)')}
        >
          <IconTrash />
        </button>
      )}
    </div>
  );
}
