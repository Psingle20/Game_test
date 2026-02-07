// Dynamic Game Loader with LÖVE.js Runtime Management
export class GameLoader {
  constructor(supabase) {
    this.supabase = supabase;
    this.currentGame = null;
    this.loveRuntimeLoaded = false;
    this.gameContainer = null;
    this.canvas = null;
  }

  async loadGame(gameId, gameName) {
    // Create fullscreen game container
    this.createGameContainer();

    // Show loading screen
    this.showLoadingScreen(gameName);

    // Set up back button
    this.setupBackButton();

    // Navigate to game page (optimized approach)
    // Instead of full page reload, we'll load the game in an iframe
    // This allows better caching and smoother transitions
    await this.loadGameInFrame(gameId, gameName);
  }

  createGameContainer() {
    // Remove existing container if any
    if (this.gameContainer) {
      this.gameContainer.remove();
    }

    // Create new fullscreen container
    this.gameContainer = document.createElement('div');
    this.gameContainer.id = 'game-container';
    this.gameContainer.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    document.body.appendChild(this.gameContainer);
  }

  showLoadingScreen(gameName) {
    this.gameContainer.innerHTML = `
      <div style="text-align: center; color: white; font-family: 'Press Start 2P', monospace;">
        <div style="font-size: 2rem; margin-bottom: 20px;">🎮</div>
        <div style="font-size: 0.8rem; color: #00ffe7; margin-bottom: 30px;">LOADING ${gameName.toUpperCase()}</div>
        <div style="width: 300px; height: 12px; background: #151525; border-radius: 20px; overflow: hidden; border: 1px solid #252540;">
          <div id="load-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #00ffe7, #00b3ff); border-radius: 20px; transition: width 0.3s;"></div>
        </div>
        <div id="load-percent" style="font-size: 0.6rem; color: #00ffe7; margin-top: 15px;">0%</div>
      </div>
    `;
  }

  setupBackButton() {
    // Create back button overlay
    const backBtn = document.createElement('div');
    backBtn.id = 'game-back-btn';
    backBtn.innerHTML = '✕';
    backBtn.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 99999;
      background: rgba(0,0,0,0.6);
      border: 2px solid rgba(0,255,231,0.5);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #00ffe7;
      font-size: 20px;
      font-weight: bold;
      backdrop-filter: blur(4px);
      opacity: 1;
      transition: opacity 0.3s, transform 0.1s;
    `;

    backBtn.addEventListener('click', () => this.closeGame());
    backBtn.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      backBtn.style.transform = 'scale(0.9)';
    });
    backBtn.addEventListener('touchend', () => {
      backBtn.style.transform = 'scale(1)';
    });

    // Auto-fade after 4 seconds
    setTimeout(() => {
      backBtn.style.opacity = '0.3';
    }, 4000);

    // Show on touch/mouse
    const showButton = () => {
      backBtn.style.opacity = '1';
      clearTimeout(backBtn.fadeTimer);
      backBtn.fadeTimer = setTimeout(() => {
        backBtn.style.opacity = '0.3';
      }, 4000);
    };

    document.addEventListener('touchstart', showButton);
    document.addEventListener('mousemove', showButton);

    this.gameContainer.appendChild(backBtn);
  }

  async loadGameInFrame(gameId, gameName) {
    // Create iframe for game (better isolation and caching)
    const iframe = document.createElement('iframe');
    iframe.id = 'game-iframe';
    iframe.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: none;
      background: #000;
    `;

    // Set iframe source based on game ID
    const gameUrls = {
      'snake': './snake/index.html',
      'escape-protocol': './escape-protocol/index.html'
    };

    iframe.src = gameUrls[gameId] || gameUrls['snake'];

    // Monitor iframe load
    iframe.addEventListener('load', () => {
      console.log(`Game ${gameName} loaded successfully`);
      this.currentGame = { gameId, gameName, iframe };
    });

    // Add iframe to container
    this.gameContainer.appendChild(iframe);

    // Request fullscreen
    await this.requestFullscreen();

    // Track game session start
    if (this.supabase) {
      await this.trackGameSession(gameId, 'start');
    }
  }

  async requestFullscreen() {
    // Skip if already in fullscreen or PWA mode
    if (document.fullscreenElement || window.navigator.standalone) {
      return;
    }

    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      }
    } catch (error) {
      console.log('Fullscreen not available:', error);
    }
  }

  async closeGame() {
    if (!this.currentGame) return;

    // Track game session end
    if (this.supabase) {
      await this.trackGameSession(this.currentGame.gameId, 'end');
    }

    // Exit fullscreen
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.log('Failed to exit fullscreen:', error);
      }
    }

    // Remove game container
    if (this.gameContainer) {
      this.gameContainer.style.opacity = '0';
      this.gameContainer.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        this.gameContainer?.remove();
        this.gameContainer = null;
      }, 300);
    }

    this.currentGame = null;
  }

  async trackGameSession(gameId, eventType) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return;

      await this.supabase.from('game_sessions').insert({
        user_id: user.id,
        game_id: gameId,
        event_type: eventType,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track game session:', error);
    }
  }
}
