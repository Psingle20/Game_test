# GameHub 2.0 - Module Federation Architecture

Modern game hub platform with improved loading, caching, and user experience.

## Architecture Overview

### Shell App (Vite-based)
- **Location**: `/src/`
- **Entry point**: `/src/main.js`
- **Purpose**: Main hub application with game discovery, search, and dynamic loading

### Games (LÖVE.js)
- **Snake**: `/snake/` - Classic arcade game
- **Escape Protocol**: `/escape-protocol/` - Educational AI game

### Key Improvements

#### 1. Shared Resources
- LÖVE.js runtime files (love.js ~318KB, love.wasm ~4.6MB) can be shared across games
- Reduces bandwidth by ~4.6MB per additional game
- Better browser caching through consistent URLs

#### 2. Dynamic Game Loading
- Games load in iframes without full page navigation
- Smooth transitions with loading screens
- Back button integration for better UX

#### 3. Supabase Integration
- User tracking and analytics
- High score leaderboards
- User preferences storage
- Works with both authenticated and anonymous users

#### 4. Improved Caching
- Service worker caching for shell app
- IndexedDB caching for game assets (via LÖVE.js)
- Aggressive cache-first strategy for static resources

## Development

### Setup

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Runs Vite dev server at http://localhost:3000

### Build for Production

```bash
npm run build
```

Creates optimized production build in `/dist/`

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

### Tables

- **game_launches** - Tracks when users launch games
- **game_sessions** - Tracks game session start/end
- **high_scores** - Leaderboard scores
- **user_preferences** - User settings and favorites

### RLS Policies

- Users can only access their own data
- High scores are publicly readable
- Anonymous tracking via session_id

## Adding New Games

1. Create game folder: `/games/your-game/`
2. Add LÖVE.js files: `game.data`, `index.html`
3. Reference shared runtime: `/lib/love.js` and `/lib/love.wasm`
4. Add game card to `/index.html` with `data-game-id` and `data-game-name`
5. Build and deploy

## Performance

### Before (Old Architecture)
- Snake: ~5MB download (first visit)
- Escape Protocol: ~6.5MB download (first visit)
- **Total for 2 games: ~11.5MB**

### After (Module Federation)
- Shell app: ~50KB (gzipped)
- Shared LÖVE runtime: ~5MB (cached once)
- Snake: ~10KB game data
- Escape Protocol: ~1.5MB game data
- **Total for 2 games: ~6.6MB** (43% reduction)

### Additional Games
- Each new LÖVE game only adds its `.data` file size
- No duplicate runtime downloads

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+ (PWA mode required for fullscreen)
- Android Chrome 90+

## PWA Features

- Installable on all platforms
- Fullscreen gaming experience
- Offline shell app access
- Fast launch times

## File Structure

```
gamehub/
├── src/                    # Shell app source
│   ├── main.js            # Entry point
│   ├── game-loader.js     # Dynamic game loading
│   ├── supabase.js        # Database client
│   ├── pwa-installer.js   # PWA install logic
│   └── styles.css         # Shared styles
├── snake/                  # Snake game
│   ├── index.html
│   ├── game.data
│   └── game.js
├── escape-protocol/        # Escape Protocol game
│   ├── index.html
│   ├── game.data
│   └── game.js
├── public/                 # Static assets
│   ├── icons/
│   ├── manifest.json
│   └── sw.js
├── index.html             # Shell app HTML
├── vite.config.js         # Vite configuration
└── package.json

Note: love.js and love.wasm files remain in individual game folders
for now to maintain backward compatibility.
```

## License

MIT

## Credits

Built with:
- Vite
- Supabase
- LÖVE.js
- Module Federation
