export const CHAT_BACKGROUNDS = [
  {
    id: 'default',
    label: 'Default',
    preview: null,
    style: null,
  },
  {
    id: 'wa-classic',
    label: 'Classic',
    preview: '#daf0d4',
    style: { background: '#daf0d4' },
  },
  {
    id: 'dots',
    label: 'Dots',
    preview: '#e8eff8',
    style: {
      backgroundColor: '#e8eff8',
      backgroundImage: 'radial-gradient(circle, #9ab0c8 1.2px, transparent 1.2px)',
      backgroundSize: '22px 22px',
    },
  },
  {
    id: 'grid',
    label: 'Grid',
    preview: '#f2f4f7',
    style: {
      backgroundColor: '#f2f4f7',
      backgroundImage:
        'linear-gradient(rgba(100,116,139,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.12) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    },
  },
  {
    id: 'diagonal',
    label: 'Lines',
    preview: '#fdf6ec',
    style: {
      backgroundColor: '#fdf6ec',
      backgroundImage:
        'repeating-linear-gradient(45deg, rgba(180,140,100,.12) 0px, rgba(180,140,100,.12) 1px, transparent 1px, transparent 18px)',
    },
  },
  {
    id: 'midnight',
    label: 'Midnight',
    preview: '#0d1b2a',
    style: { background: 'linear-gradient(160deg, #0d1b2a 0%, #1a2f4a 100%)' },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    preview: '#1a3a5c',
    style: { background: 'linear-gradient(160deg, #0f2942 0%, #1a4a6e 50%, #1e6090 100%)' },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    preview: '#f4845f',
    style: { background: 'linear-gradient(160deg, #c8413a 0%, #e8724a 40%, #f5a623 100%)' },
  },
  {
    id: 'blush',
    label: 'Blush',
    preview: '#f5dde8',
    style: { background: 'linear-gradient(160deg, #f5dde8 0%, #fce8f3 100%)' },
  },
  {
    id: 'forest',
    label: 'Forest',
    preview: '#1a2e1a',
    style: { background: 'linear-gradient(160deg, #0f1f0f 0%, #1e3a1e 60%, #264a26 100%)' },
  },
  {
    id: 'lavender',
    label: 'Lavender',
    preview: '#ddd8f5',
    style: { background: 'linear-gradient(160deg, #ddd8f5 0%, #ede8fc 100%)' },
  },
  {
    id: 'charcoal',
    label: 'Charcoal',
    preview: '#1c1c1e',
    style: { background: '#1c1c1e' },
  },

  // WhatsApp-style backgrounds
  {
    id: 'wa-doodle-light',
    label: 'Doodle Light',
    preview: '#f0ebe3',
    style: {
      background: '#f0ebe3',
      backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><text y='18' font-size='14' fill='%23c5b8a8'>📱</text><text x='40' y='45' font-size='12' fill='%23c5b8a8'>♪</text><text x='10' y='65' font-size='13' fill='%23c5b8a8'>❤</text><text x='55' y='70' font-size='11' fill='%23c5b8a8'>📷</text><text x='30' y='32' font-size='10' fill='%23c5b8a8'>✈</text></svg>")`,
      backgroundSize: '80px 80px',
    },
  },
  {
    id: 'wa-doodle-dark',
    label: 'Doodle Dark',
    preview: '#0d1418',
    style: {
      background: '#0d1418',
      backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><text y='18' font-size='14' fill='%231e2d35'>📱</text><text x='40' y='45' font-size='12' fill='%231e2d35'>♪</text><text x='10' y='65' font-size='13' fill='%231e2d35'>❤</text><text x='55' y='70' font-size='11' fill='%231e2d35'>📷</text><text x='30' y='32' font-size='10' fill='%231e2d35'>✈</text></svg>")`,
      backgroundSize: '80px 80px',
    },
  },
  {
    id: 'wa-solid-white',
    label: 'Solid White',
    preview: '#ffffff',
    style: { background: '#ffffff' },
  },
  {
    id: 'wa-solid-black',
    label: 'Solid Black',
    preview: '#000000',
    style: { background: '#000000' },
  },
  {
    id: 'wa-teal-blue',
    label: 'Teal → Blue',
    preview: '#1a6b5a',
    style: { background: 'linear-gradient(135deg, #1a6b5a 0%, #1a3a6b 100%)' },
  },
  {
    id: 'wa-coral-purple',
    label: 'Coral → Purple',
    preview: '#c0392b',
    style: { background: 'linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)' },
  },
  {
    id: 'wa-sunrise',
    label: 'Sunrise',
    preview: '#f7b2b7',
    style: { background: 'linear-gradient(160deg, #f7b2b7 0%, #f9d29d 100%)' },
  },
  {
    id: 'wa-ocean',
    label: 'Ocean Deep',
    preview: '#0077b6',
    style: { background: 'linear-gradient(160deg, #00b4d8 0%, #0077b6 50%, #023e8a 100%)' },
  },
  {
    id: 'wa-solid-teal',
    label: 'WA Teal',
    preview: '#008069',
    style: { background: '#008069' },
  },
  {
    id: 'wa-doodle-colour',
    label: 'Doodle Colour',
    preview: '#fef9f0',
    style: {
      background: '#fef9f0',
      backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'><text y='16' font-size='15'>🌸</text><text x='38' y='40' font-size='13'>⭐</text><text x='8' y='58' font-size='14'>🦋</text><text x='48' y='68' font-size='12'>🌈</text><text x='24' y='30' font-size='11'>✿</text></svg>")`,
      backgroundSize: '72px 72px',
    },
  },
  {
    id: 'wa-forest',
    label: 'Forest',
    preview: '#2d6a4f',
    style: { background: 'linear-gradient(150deg, #a8e6cf 0%, #2d6a4f 100%)' },
  },
  {
    id: 'wa-doodle-night',
    label: 'Doodle Night',
    preview: '#1a1a2e',
    style: {
      background: '#1a1a2e',
      backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><text y='18' font-size='14' fill='%2328284a'>🌙</text><text x='40' y='44' font-size='12' fill='%2328284a'>⭐</text><text x='8' y='62' font-size='13' fill='%2328284a'>✦</text><text x='54' y='70' font-size='11' fill='%2328284a'>🌟</text><text x='26' y='30' font-size='10' fill='%2328284a'>✧</text></svg>")`,
      backgroundSize: '80px 80px',
    },
  },
];

export const THEMES = {
  'Aurora Mesh': {
    bg: 'conic-gradient(from 200deg at 30% 40%, #0d1b4b 0deg, #0a2e3d 60deg, #071a2e 120deg, #0d1b4b 180deg, #0f2040 240deg, #071524 300deg, #060d1f 360deg)',
    panel: '#0b1630',
    panel2: '#0f1f40',
    border: 'rgba(0,200,150,0.18)',
    text: '#f0f8ff',
    sub: '#6a9ab5',
    accent: '#00c896',
    onAccent: '#030d1a',
    accentSoft: 'rgba(0,200,150,0.14)',
    bubble: '#101e38',
    accentGradient: 'linear-gradient(135deg, #00c896 0%, #0088ff 100%)',
    auroraGlow: true,
  },
  'Slate (light)': {
    bg: '#EEF0F3', panel: '#FFFFFF', panel2: '#F3F4F6', border: '#E3E6EA',
    text: '#191C20', sub: '#667085', accent: '#3B6FE0', onAccent: '#FFFFFF',
    accentSoft: '#EBF0FC', bubble: '#F1F2F5',
  },
  'Carbon (dark)': {
    bg: '#0E1012', panel: '#16181B', panel2: '#22262B', border: '#26292F',
    text: '#E9ECEF', sub: '#8B929C', accent: '#46B584', onAccent: '#0B1210',
    accentSoft: '#1B2A24', bubble: '#22262B',
  },
  'Paper (warm)': {
    bg: '#F3EEE4', panel: '#FDFBF6', panel2: '#F1EADD', border: '#E4DCCB',
    text: '#2A251D', sub: '#8A8071', accent: '#C05B38', onAccent: '#FFF8F2',
    accentSoft: '#F6E4DB', bubble: '#EFE8DA',
  },
  'Bright mode': {
    bg: '#0F0D18', panel: '#181524', panel2: '#211D30', border: '#2B2640',
    text: '#F3F0FA', sub: '#9791AE', accent: '#8B5CF6', onAccent: '#FFFFFF',
    accentSoft: '#2A2340', bubble: '#221F30',
    accentGradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 55%, #FB923C 100%)',
  },
};
