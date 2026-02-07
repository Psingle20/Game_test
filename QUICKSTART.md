# GameHub 2.0 - Quick Start Guide

Get up and running with GameHub in 5 minutes.

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000

## Project Structure

```
gamehub/
├── src/                      # Shell app (Vite + ES modules)
│   ├── main.js              # App initialization
│   ├── game-loader.js       # Dynamic game loading
│   ├── supabase.js          # Database client
│   ├── pwa-installer.js     # PWA install flows
│   └── styles.css           # Global styles
│
├── snake/                    # Snake game (LÖVE.js)
│   ├── index.html           # Game launcher
│   ├── game.js              # Asset loader
│   ├── game.data            # Game + assets (9KB)
│   ├── love.js              # LÖVE runtime (318KB)
│   └── love.wasm            # WASM binary (4.6MB)
│
├── escape-protocol/          # Escape Protocol (LÖVE.js)
│   └── (same structure as snake)
│
├── public/                   # Static assets
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service worker
│   └── icons/               # App icons
│
├── index.html               # Shell HTML
├── vite.config.js           # Vite configuration
└── package.json
```

## How It Works

### 1. Shell App Loads
```
User visits site
  ↓
index.html loads
  ↓
Vite bundles: main.js + dependencies
  ↓
Shell app initializes
```

### 2. User Clicks Game
```
Game card clicked
  ↓
GameLoader creates fullscreen container
  ↓
Loads game in iframe
  ↓
Game's LÖVE.js initializes
  ↓
Game runs
```

### 3. Caching Strategy
```
First Visit:
  Shell: Download → Cache
  WASM: Download → Cache
  Game: Download → Cache

Second Visit:
  Shell: Cache (instant)
  WASM: Cache (instant)
  Game: Cache (instant)
```

## Key Files Explained

### `src/main.js`
Shell app entry point. Initializes:
- Supabase client
- Game loader
- PWA installer
- Event listeners

### `src/game-loader.js`
Handles dynamic game loading:
- Creates fullscreen container
- Loads game in iframe
- Manages back button
- Tracks sessions

### `src/supabase.js`
Database client singleton:
- Connects to Supabase
- Provides fallback for dev
- Handles auth state

### `public/sw.js`
Service worker with multi-tier caching:
- Cache-first for WASM/images
- Network-first for HTML
- Stale-while-revalidate for CSS/JS

## Common Tasks

### Add a New Game

1. **Create game folder:**
   ```bash
   mkdir my-game
   # Add game files: index.html, game.data, etc.
   ```

2. **Add to hub (`index.html`):**
   ```html
   <div class="game-card"
        data-game-id="my-game"
        data-game-name="MY GAME"
        data-category="arcade">
     <div class="game-icon">🎮</div>
     <div class="game-title">MY GAME</div>
     <div class="game-category">Arcade</div>
   </div>
   ```

3. **Build and test:**
   ```bash
   npm run build
   npm run preview
   ```

### Update Styles

Edit `src/styles.css` - changes apply to shell app.
Game-specific styles go in each game's folder.

### Add Supabase Feature

```javascript
// In src/main.js or game-loader.js
import { getSupabase } from './supabase.js';

const supabase = getSupabase();

// Query
const { data, error } = await supabase
  .from('high_scores')
  .select('*')
  .eq('game_id', 'snake')
  .order('score', { ascending: false })
  .limit(10);

// Insert
const { error } = await supabase
  .from('high_scores')
  .insert({
    game_id: 'snake',
    score: 1000,
    player_name: 'Player'
  });
```

### Modify Service Worker

Edit `public/sw.js`:
- Update `CACHE_VERSION` to invalidate caches
- Add new caching rules
- Update cached file lists

### Debug Issues

```bash
# Clear caches
rm -rf .vite node_modules/.vite

# Reinstall
npm install

# Build fresh
npm run build

# Check logs
npm run dev
# Open browser console
```

## Environment Setup

### Development

Create `.env`:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_key
```

### Production

Set on hosting platform:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_key
```

## Testing

### Local Testing

```bash
npm run dev        # Dev server with HMR
npm run build      # Production build
npm run preview    # Test production build
```

### Browser Testing

Open DevTools:
- **Console**: Check for errors
- **Network**: Verify caching
- **Application**: Check SW status
- **Lighthouse**: Performance audit

### Mobile Testing

1. Get local IP: `ipconfig` or `ifconfig`
2. Visit `http://YOUR_IP:3000` on mobile
3. Test PWA installation
4. Test fullscreen gaming

## Deployment

### Quick Deploy to GitHub Pages

```bash
npm run build
# Commit dist/ folder
git add .
git commit -m "Deploy"
git push
```

GitHub Actions will deploy automatically.

### Deploy to Netlify

```bash
netlify deploy --prod --dir=dist
```

Or connect GitHub repo for continuous deployment.

## Troubleshooting

### "Module not found"
```bash
rm -rf node_modules
npm install
```

### "Service worker not updating"
1. Update `CACHE_VERSION` in `sw.js`
2. Hard refresh (Ctrl+Shift+R)
3. Clear site data in DevTools

### "Game not loading"
1. Check browser console for errors
2. Verify game files in `dist/` after build
3. Check Network tab for 404s

### "Supabase errors"
1. Verify `.env` file exists
2. Check API keys are correct
3. Ensure database migrations applied

## Performance Tips

1. **Use production build for testing:**
   ```bash
   npm run build && npm run preview
   ```

2. **Enable compression on server:**
   - gzip or brotli for text files
   - Already done on Netlify/Vercel

3. **Monitor bundle size:**
   ```bash
   npm run build
   # Check dist/assets/ sizes
   ```

4. **Lighthouse audit:**
   - Open DevTools
   - Lighthouse tab
   - Generate report

## Resources

- [README.md](README.md) - Architecture overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [IMPROVEMENTS.md](IMPROVEMENTS.md) - What changed
- [Vite Docs](https://vitejs.dev)
- [Supabase Docs](https://supabase.com/docs)

## Next Steps

1. ✅ Project running locally
2. ⬜ Configure Supabase (optional)
3. ⬜ Customize styles
4. ⬜ Add your own games
5. ⬜ Deploy to production

## Support

Having issues?
1. Check browser console for errors
2. Review this guide
3. Check closed issues on GitHub
4. Open a new issue with:
   - Error message
   - Browser/OS
   - Steps to reproduce

Happy coding!
