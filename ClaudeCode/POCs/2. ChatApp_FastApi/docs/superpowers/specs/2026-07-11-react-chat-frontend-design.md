# React Chat Frontend Design Document

**Date:** 2026-07-11  
**Project:** Chat Application Frontend  
**Backend:** FastAPI + Ollama Chat Service

---

## Overview

A full-featured React frontend for the FastAPI chat backend that provides multiple concurrent chat sessions, model switching, conversation persistence, and JSON export functionality. The application uses a clean, modern UI with a session grid layout.

---

## Architecture

### Technology Stack
- **Build Tool:** Vite (fast HMR, optimal bundle size)
- **Framework:** React 18+ with hooks
- **Styling:** Tailwind CSS (utility-first, rapid development)
- **HTTP Client:** Fetch API with async/await
- **Storage:** localStorage for session persistence
- **Dev Server:** Vite dev server proxy to FastAPI (port 8000)

### Application Structure
- **Single-page application** with view switching (grid ↔ chat)
- **Client-side routing** via state management (no React Router needed)
- **API proxy** through Vite for development, direct calls in production

---

## Component Structure

### Core Components
- `App` - Root component, manages view routing and global state
- `SessionGrid` - Grid view displaying all session cards
- `SessionCard` - Individual session card with title, preview, date, model
- `ChatView` - Full chat interface for a specific session
- `MessageList` - Scrollable list of messages
- `MessageBubble` - Individual message with role-based styling
- `ChatInput` - Text input area with send button
- `ModelSelector` - Dropdown for AI model selection
- `ExportButton` - Button to trigger JSON export

### UI Components
- `Button` - Reusable button with variants (primary, secondary, danger)
- `Card` - Base card component with consistent styling
- `Modal` - Dialog overlay for export confirmation
- `LoadingSpinner` - Loading indicator during API calls
- `EmptyState` - Placeholder when no sessions exist

---

## Data Flow & State Management

### State Structure
```typescript
interface AppState {
  sessions: Session[]              // All sessions from localStorage
  currentSessionId: string | null  // Currently open session
  models: Model[]                  // Available models
  isLoading: boolean               // Loading states
  error: string | null             // Error messages
}

interface Session {
  id: string                       // UUID from FastAPI
  title: string                    // Auto-generated from first message
  createdAt: string                // ISO timestamp
  updatedAt: string                // Last activity timestamp
  model: string                    // AI model used
  systemPrompt?: string            // Optional system prompt
  messages: Message[]              // Conversation history
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Model {
  name: string
  size?: number
}
```

### Data Flow
1. **App Initialization** - Load sessions from localStorage, fetch models from `/models`
2. **Create Session** - Call `/chat/start`, store session in localStorage
3. **Send Message** - Call `/chat` with session_id, update localStorage with response
4. **Switch Sessions** - Change `currentSessionId`, load session data
5. **Delete Session** - Remove from localStorage, update state
6. **Export** - Read session from localStorage, trigger JSON download

### API Integration
- Use `fetch` with async/await for all API calls
- Development: Proxy through Vite (`/api/*` → `http://localhost:8000`)
- Production: Configurable base URL (environment variable)

---

## UI Design & Styling

### Color Palette
```css
/* Neutral colors */
--bg-primary: #FFFFFF
--bg-secondary: #F8F9FA
--bg-tertiary: #E9ECEF
--text-primary: #212529
--text-secondary: #6C757D
--border-color: #DEE2E6

/* Accent colors */
--primary: #3B82F6           /* Blue for primary actions */
--primary-hover: #2563EB
--danger: #EF4444            /* Red for destructive actions */
--success: #10B981           /* Green for success states */

/* Message colors */
--user-bg: #3B82F6
--user-text: #FFFFFF
--assistant-bg: #F8F9FA
--assistant-text: #212529
```

### Typography
- **Font:** Inter or system-ui
- **Headings:** 600 weight, 1.25rem (h1), 1rem (h2)
- **Body:** 400 weight, 0.875rem
- **Messages:** 400 weight, 0.875rem

### Layout & Spacing
- **Grid view:** Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- **Card spacing:** 1rem gap between cards
- **Chat view:** Fixed header, scrollable message area, fixed bottom input
- **Corner radius:** 8px for cards, 12px for message bubbles
- **Shadows:** Subtle box-shadow (0 1px 3px rgba(0,0,0,0.1))

### Interactions
- Hover effects on cards (slight lift, shadow increase)
- Smooth transitions between views (fade in/out)
- Button hover states (color change, slight scale)
- Loading spinners during API calls

---

## Error Handling

### API Errors
- **Network errors:** User-friendly message with retry option
- **404 (unknown session):** Redirect to grid view, show error toast
- **502 (Ollama unreachable):** Show error message, disable chat input
- **Rate limiting:** "Try again later" message with retry delay

### Input Validation
- Empty messages disable send button
- All text allowed, escaped for display
- No strict length limit for messages

### localStorage Edge Cases
- Storage quota exceeded: Error message, suggest deleting old sessions
- Corrupted data: Clear and start fresh with warning
- Browser不支持: Message that persistence won't work

### Session Management Edge Cases
- No sessions: Empty state with "Create first session" button
- Deleted active session: Auto-switch to another session or grid view
- Session with no messages: Empty state in chat view
- Model unavailable: Fallback to default model with warning

### Export Edge Cases
- Export with no messages: Export empty array with metadata
- Large sessions: No size limit, but may take time
- Download failure: Error message with retry button

---

## Features

### Core Features
1. **Session Grid View** - Display all sessions as cards in responsive grid
2. **Multiple Sessions** - Support unlimited concurrent sessions
3. **Model Switching** - Select AI model per session from dropdown
4. **Conversation Persistence** - Store sessions in localStorage
5. **JSON Export** - Export individual sessions as structured JSON

### User Flow
1. User opens app → sees session grid
2. Clicks "New Session" → creates session, opens chat view
3. Types message → sends to backend, receives AI response
4. Can switch models via dropdown
5. Can export session via export button
6. Can return to grid to manage other sessions

---

## Implementation Notes

### Development Setup
```bash
cd ui
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Vite Configuration
- Configure proxy to FastAPI backend
- Set up path aliases for cleaner imports
- Configure build output for deployment

### Environment Variables
- `VITE_API_BASE_URL` - API base URL (default: `/api` for dev proxy)
- `VITE_DEFAULT_MODEL` - Default model for new sessions

### Deployment
- Build with `npm run build`
- Deploy `dist/` to any static host
- Configure production API URL via environment variable

---

## Success Criteria

1. ✅ User can create and manage multiple chat sessions
2. ✅ Sessions persist across browser refreshes
3. ✅ User can switch AI models per session
4. ✅ Conversations are exported as valid JSON
5. ✅ App works offline (after initial model fetch)
6. ✅ Responsive design works on mobile, tablet, desktop
7. ✅ Error states are handled gracefully
8. ✅ Clean, modern UI meets design specifications

---

## Future Enhancements (Out of Scope)

- Real-time streaming responses
- Search across conversations
- Filter sessions by date or model
- Code syntax highlighting
- Multiple export formats
- Cloud sync capability
- Authentication/user accounts
- Dark mode toggle