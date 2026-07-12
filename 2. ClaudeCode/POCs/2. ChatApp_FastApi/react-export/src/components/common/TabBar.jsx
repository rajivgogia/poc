import { IconHome, IconChat, IconMap } from '../../icons.jsx';

const TABS = [
  { id: 'home',    label: 'Home',       sub: 'Dashboard',    Icon: IconHome },
  { id: 'chat',    label: 'Spark Chat', sub: 'AI Assistant', Icon: IconChat },
  { id: 'travel',  label: 'Voyager',    sub: 'Trip Planner', Icon: IconMap  },
];

export function TabBar({ activeTab, onTabChange }) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 4,
        padding: '0 20px',
        background: 'var(--panel)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        height: 52,
      }}
    >
      {TABS.map(({ id, label, sub, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 18px',
              border: 'none',
              borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
              background: 'transparent',
              color: active ? 'var(--accent)' : 'var(--sub)',
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              transition: 'color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon width={18} height={18} style={{ flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, lineHeight: 1.2 }}>
                {label}
              </div>
              <div style={{ fontSize: 10.5, opacity: 0.75, lineHeight: 1.2 }}>{sub}</div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
