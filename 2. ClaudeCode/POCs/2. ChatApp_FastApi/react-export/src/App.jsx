import { useState } from 'react';
import { THEMES } from './data.js';
import { ChatProvider } from './context/ChatContext.jsx';
import { Sidebar } from './components/Sidebar/Sidebar.jsx';
import { ChatWindow } from './components/Chat/ChatWindow.jsx';
import { TabBar } from './components/common/TabBar.jsx';
import { TravelProvider } from './context/TravelContext.jsx';

export default function App({ theme = 'Slate (light)' }) {
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [activeTab, setActiveTab] = useState('chat');
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
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          background: 'var(--bg)',
          color: 'var(--text)',
          fontFamily: "'Public Sans', sans-serif",
        }}
      >
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {activeTab === 'home' && (
            <main
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sub)',
                fontSize: 15,
              }}
            >
              Home dashboard coming soon
            </main>
          )}

          {activeTab === 'chat' && (
            <>
              <Sidebar currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
              <ChatWindow currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
            </>
          )}

          {activeTab === 'travel' && (
            <TravelProvider>
              <Sidebar
                currentTheme={currentTheme}
                onThemeChange={setCurrentTheme}
                title="Voyager"
                newLabel="New Trip"
              />
              <ChatWindow currentTheme={currentTheme} onThemeChange={setCurrentTheme} newLabel="New Trip" />
            </TravelProvider>
          )}
        </div>
      </div>
    </ChatProvider>
  );
}
