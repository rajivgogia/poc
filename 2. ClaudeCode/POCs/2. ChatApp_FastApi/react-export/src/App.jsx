import { useState } from 'react';
import { THEMES } from './data.js';
import { ChatProvider } from './context/ChatContext.jsx';
import { Sidebar } from './components/Sidebar/Sidebar.jsx';
import { ChatWindow } from './components/Chat/ChatWindow.jsx';

export default function App({ theme = 'Slate (light)' }) {
  const [currentTheme, setCurrentTheme] = useState(theme);
  const t = THEMES[currentTheme] || THEMES['Slate (light)'];

  const vars = {
    '--bg': t.bg, '--panel': t.panel, '--panel2': t.panel2, '--border': t.border,
    '--text': t.text, '--sub': t.sub, '--accent': t.accent, '--on-accent': t.onAccent,
    '--accent-soft': t.accentSoft, '--bubble': t.bubble,
    '--accent-gradient': t.accentGradient || t.accent,
  };

  return (
    <ChatProvider>
      <div
        style={{
          ...vars,
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          background: 'var(--bg)',
          color: 'var(--text)',
          fontFamily: "'Public Sans', sans-serif",
        }}
      >
        <Sidebar currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
        <ChatWindow currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      </div>
    </ChatProvider>
  );
}
