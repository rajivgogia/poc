import { useState } from 'react';
import { THEMES } from './data.js';
import { ChatProvider } from './context/ChatContext.jsx';
import { Sidebar } from './components/Sidebar/Sidebar.jsx';
import { ChatWindow } from './components/Chat/ChatWindow.jsx';
import { TabBar } from './components/common/TabBar.jsx';
import { TravelProvider } from './context/TravelContext.jsx';
import { HomePage } from './components/Home/HomePage.jsx';

export default function App({ theme = 'Aurora Mesh' }) {
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatBg, setChatBg] = useState(() => {
    try { return localStorage.getItem('chat_bg') || 'default'; } catch { return 'default'; }
  });

  function handleChatBgChange(id) {
    setChatBg(id);
    try { localStorage.setItem('chat_bg', id); } catch {}
  }
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
          position: 'relative',
        }}
      >
        {t.auroraGlow && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '45%',
              background: 'linear-gradient(180deg, rgba(0,200,150,0.10) 0%, rgba(0,136,255,0.07) 45%, transparent 100%)',
              filter: 'blur(64px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative', zIndex: 1 }}>
          {activeTab === 'home' && (
            <HomePage onNavigate={setActiveTab} />
          )}

          {activeTab === 'chat' && (
            <>
              <Sidebar currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
              <ChatWindow currentTheme={currentTheme} onThemeChange={setCurrentTheme} chatBg={chatBg} onChatBgChange={handleChatBgChange} />
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
              <ChatWindow currentTheme={currentTheme} onThemeChange={setCurrentTheme} newLabel="New Trip" chatBg={chatBg} onChatBgChange={handleChatBgChange} />
            </TravelProvider>
          )}
        </div>
      </div>
    </ChatProvider>
  );
}
