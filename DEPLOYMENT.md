# GameHub Deployment Guide

## Prerequisites

1. Node.js 18+ and npm
2. Supabase account (for tracking features)
3. Static hosting service (GitHub Pages, Netlify, Vercel, etc.)

## Setup Supabase (Optional but Recommended)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for project initialization

### 2. Get API Keys

1. Go to Project Settings > API
2. Copy the following:
   - Project URL
   - Anon/Public Key

### 3. Configure Environment

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run Migrations

Migrations are automatically applied when you use the Supabase tools.
The schema includes:
- `game_launches` - Track game starts
- `game_sessions` - Track play sessions
- `high_scores` - Leaderboards
- `user_preferences` - User settings

## Local Development

### Install Dependencies

```bash
npm install
```

### Start Dev Server

```bash
npm run dev
```

Open http://localhost:3000

## Production Build

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with:
- Optimized shell app
- Game folders (snake, escape-protocol)
- Static assets

### Test Production Build

```bash
npm run preview
```

## Deployment Options

### Option 1: GitHub Pages

1. Build the project:
   ```bash
   npm run build
   ```

2. The GitHub Actions workflow is already configured in `.github/workflows/static.yml`

3. Update the workflow to build before deployment:
   ```yaml
   - name: Install and Build
     run: |
       npm install
       npm run build
   - name: Upload artifact
     uses: actions/upload-pages-artifact@v3
     with:
       path: 'dist'
   ```

4. Push to main branch - GitHub Actions will deploy automatically

### Option 2: Netlify

1. Connect your GitHub repository to Netlify

2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables: Add your Supabase keys

3. Add `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [[headers]]
     for = "/sw.js"
     [headers.values]
       Cache-Control = "public, max-age=0, must-revalidate"
   ```

4. Deploy

### Option 3: Vercel

1. Connect repository to Vercel

2. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variables

3. Deploy

### Option 4: Self-Hosted

1. Build the project:
   ```bash
   npm run build
   ```

2. Copy `dist/` folder to your web server

3. Configure nginx or Apache:

   **Nginx:**
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;
     root /path/to/dist;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }

     location /sw.js {
       add_header Cache-Control "public, max-age=0, must-revalidate";
     }

     location ~* \.(wasm|data)$ {
       add_header Cache-Control "public, max-age=31536000, immutable";
     }
   }
   ```

   **Apache (.htaccess):**
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]

   <Files "sw.js">
     Header set Cache-Control "public, max-age=0, must-revalidate"
   </Files>

   <FilesMatch "\.(wasm|data)$">
     Header set Cache-Control "public, max-age=31536000, immutable"
   </FilesMatch>
   ```

## Environment Variables for Production

Add these to your hosting platform:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Post-Deployment Checklist

- [ ] PWA installable on mobile devices
- [ ] Games load without errors
- [ ] Service worker caching works
- [ ] Back button returns to hub
- [ ] Fullscreen works on mobile
- [ ] Supabase tracking functional (if enabled)
- [ ] HTTPS enabled (required for PWA)

## Troubleshooting

### Games not loading
- Check browser console for errors
- Verify game files copied to dist/
- Check CORS headers if games on different domain

### PWA not installing
- Ensure site served over HTTPS
- Check manifest.json accessible
- Verify service worker registered

### Supabase errors
- Verify environment variables set
- Check API keys are correct
- Ensure RLS policies allow operations

### Build failures
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Update dependencies: `npm update`

## Performance Optimization

### Enable Compression

Configure your server to serve gzip/brotli:

**Nginx:**
```nginx
gzip on;
gzip_types text/css application/javascript application/json application/wasm;
gzip_min_length 1000;
```

### CDN Recommendations

For best performance, serve static assets through a CDN:
- CloudFlare (free tier available)
- AWS CloudFront
- Fastly

### Cache Strategy

The service worker implements:
- Cache-first for WASM files (~4.6MB each)
- Network-first for HTML
- Cache-first for CSS/JS/images

## Monitoring

### Recommended Tools

- Google Analytics for traffic
- Sentry for error tracking
- Supabase Analytics for user tracking
- Lighthouse for performance audits

## Security

- RLS policies protect user data
- API keys are client-safe (anon key)
- No sensitive data in client code
- HTTPS required for production

## Support

For issues or questions:
- Check README.md for architecture details
- Review browser console for errors
- Check Supabase dashboard for data issues
