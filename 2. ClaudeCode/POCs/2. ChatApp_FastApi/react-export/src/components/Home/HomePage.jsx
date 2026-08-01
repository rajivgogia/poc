import { IconChat, IconMap, IconSettings } from '../../icons.jsx';
import { THEMES } from '../../data.js';

const s = {
  // Layout
  page: {
    flex: 1,
    overflowY: 'auto',
    padding: '52px 48px 72px',
    position: 'relative',
  },
  body: { position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto' },

  // Eyebrow
  eyebrow: { display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 22 },
  eyebrowLine: {
    width: 28, height: 2,
    background: 'linear-gradient(90deg, #00c896, #0088ff)',
    borderRadius: 2,
  },
  eyebrowText: {
    fontSize: 11, fontWeight: 700, color: '#00c896',
    letterSpacing: '1.6px', textTransform: 'uppercase',
    fontFamily: "'Space Grotesk', sans-serif",
  },

  // Hero text
  h1: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 'clamp(36px, 5vw, 54px)',
    fontWeight: 800, color: '#f0f8ff',
    letterSpacing: '-2px', lineHeight: 1.06,
    marginBottom: 18, textWrap: 'balance',
  },
  h1Gradient: {
    background: 'linear-gradient(90deg, #00c896, #0088ff)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  sub: {
    fontSize: 16, color: 'rgba(255,255,255,0.45)',
    fontFamily: "'Space Grotesk', sans-serif",
    maxWidth: 440, lineHeight: 1.75, marginBottom: 52,
  },

  // Cards grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16, marginBottom: 20,
  },
  cardMain: {
    borderRadius: 20, padding: 28,
    background: 'linear-gradient(145deg, rgba(0,200,150,0.12), rgba(0,136,255,0.06))',
    border: '1px solid rgba(0,200,150,0.25)',
    position: 'relative', overflow: 'hidden',
    cursor: 'pointer',
  },
  cardSm: {
    borderRadius: 20, padding: 28,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    position: 'relative', overflow: 'hidden',
    cursor: 'pointer',
  },
  cardCorner: {
    position: 'absolute', top: 0, right: 0, width: 100, height: 100,
    background: 'radial-gradient(circle at 80% 20%, rgba(0,200,150,0.2), transparent 70%)',
    pointerEvents: 'none',
  },
  cardCornerBlue: {
    position: 'absolute', top: 0, right: 0, width: 100, height: 100,
    background: 'radial-gradient(circle at 80% 20%, rgba(0,136,255,0.18), transparent 70%)',
    pointerEvents: 'none',
  },
  iconBox: {
    width: 46, height: 46, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
  },
  iconBoxTeal: { background: 'rgba(0,200,150,0.15)', color: '#00c896' },
  iconBoxBlue: { background: 'rgba(0,136,255,0.15)', color: '#0088ff' },
  iconBoxPurple: { background: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
  cardTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 19, fontWeight: 700, color: '#f0f8ff',
    letterSpacing: '-0.3px', marginBottom: 10,
  },
  cardDesc: {
    fontSize: 13.5, color: 'rgba(255,255,255,0.42)',
    lineHeight: 1.65, fontFamily: "'Space Grotesk', sans-serif",
    marginBottom: 24,
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '9px 20px', borderRadius: 10, border: 'none',
    background: 'rgba(0,200,150,0.15)', color: '#00c896',
    border: '1px solid rgba(0,200,150,0.3)',
    fontSize: 13, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    cursor: 'pointer',
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '9px 20px', borderRadius: 10,
    background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    fontSize: 13, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    cursor: 'pointer',
  },

  // Theme picker
  themeSection: { marginTop: 32 },
  themeSectionTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
    letterSpacing: '1.2px', textTransform: 'uppercase',
    marginBottom: 12,
  },
  themeRow: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  themeChip: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
    border: '1.5px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, fontWeight: 600,
    transition: 'border-color 0.15s, background 0.15s',
  },
  themeChipActive: {
    border: '1.5px solid rgba(0,200,150,0.55)',
    background: 'rgba(0,200,150,0.08)',
  },
  themeSwatch: {
    width: 14, height: 14, borderRadius: '50%',
    flexShrink: 0,
  },

  // Stats row
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginTop: 16 },
  stat: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14, padding: '20px 24px',
  },
  statNum: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 28, fontWeight: 800,
    background: 'linear-gradient(90deg, #00c896, #0088ff)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', lineHeight: 1.1,
  },
  statLabel: {
    fontSize: 12, color: 'rgba(255,255,255,0.35)',
    marginTop: 4, fontFamily: "'Space Grotesk', sans-serif",
  },
};

export function HomePage({ onNavigate, currentTheme, onThemeChange }) {
  return (
    <main style={s.page}>
      <div style={s.body}>

        {/* Eyebrow */}
        <div style={s.eyebrow}>
          <div style={s.eyebrowLine} />
          <span style={s.eyebrowText}>Your AI Workspace</span>
        </div>

        {/* Hero headline */}
        <h1 style={s.h1}>
          Chat smarter,{' '}
          <span style={s.h1Gradient}>plan further</span>
        </h1>
        <p style={s.sub}>
          One interface for AI conversations and intelligent travel planning — powered by Ollama, built for speed.
        </p>

        {/* Feature cards */}
        <div style={s.grid}>

          {/* Main card — Spark Chat */}
          <div style={s.cardMain} onClick={() => onNavigate?.('chat')}>
            <div style={s.cardCorner} />
            <div style={{ ...s.iconBox, ...s.iconBoxTeal }}>
              <IconChat width={22} height={22} />
            </div>
            <div style={s.cardTitle}>Spark Chat</div>
            <div style={s.cardDesc}>
              Multi-session AI conversations with full history. Ask anything, get sharp answers — no context lost between messages.
            </div>
            <button style={s.btnPrimary} onClick={(e) => { e.stopPropagation(); onNavigate?.('chat'); }}>
              Open Chat →
            </button>
          </div>

          {/* Voyager */}
          <div style={s.cardSm} onClick={() => onNavigate?.('travel')}>
            <div style={s.cardCornerBlue} />
            <div style={{ ...s.iconBox, ...s.iconBoxBlue }}>
              <IconMap width={22} height={22} />
            </div>
            <div style={s.cardTitle}>Voyager</div>
            <div style={s.cardDesc}>
              Four-phase AI trip planner. Drop in your dates and preferences — get a day-by-day itinerary with real places and restaurants.
            </div>
            <button style={s.btnGhost} onClick={(e) => { e.stopPropagation(); onNavigate?.('travel'); }}>
              Plan a trip →
            </button>
          </div>

          {/* Coming soon */}
          <div style={{ ...s.cardSm, opacity: 0.6 }}>
            <div style={{ ...s.iconBox, ...s.iconBoxPurple }}>
              <IconSettings width={22} height={22} />
            </div>
            <div style={s.cardTitle}>More coming</div>
            <div style={s.cardDesc}>
              Image generation, document Q&A, and code assistant modes are next. Stay tuned.
            </div>
            <span style={{ ...s.btnGhost, opacity: 0.5, cursor: 'default', display: 'inline-flex' }}>
              Coming soon
            </span>
          </div>

        </div>

        {/* Theme picker */}
        <div style={s.themeSection}>
          <div style={s.themeSectionTitle}>App Theme</div>
          <div style={s.themeRow}>
            {Object.entries(THEMES).map(([name, t]) => (
              <button
                key={name}
                style={{
                  ...s.themeChip,
                  ...(currentTheme === name ? s.themeChipActive : {}),
                  color: currentTheme === name ? '#00c896' : 'rgba(255,255,255,0.55)',
                }}
                onClick={() => onThemeChange?.(name)}
              >
                <span style={{ ...s.themeSwatch, background: t.accent }} />
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={s.statsRow}>
          {[
            { num: 'Local', label: 'Models via Ollama' },
            { num: '∞', label: 'Parallel sessions' },
            { num: '0 ms', label: 'Cold-start latency' },
            { num: '5', label: 'Built-in themes' },
            { num: '24', label: 'Chat backgrounds' },
          ].map(({ num, label }) => (
            <div key={label} style={s.stat}>
              <div style={s.statNum}>{num}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
