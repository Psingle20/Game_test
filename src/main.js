// GameHub Shell Application - Main Entry Point
import { initSupabase } from './supabase.js';
import { GameLoader } from './game-loader.js';
import { PWAInstaller } from './pwa-installer.js';
import './styles.css';

class GameHub {
  constructor() {
    this.supabase = null;
    this.gameLoader = null;
    this.pwaInstaller = null;
    this.currentUser = null;
  }

  async init() {
    // Initialize Supabase
    this.supabase = initSupabase();

    // Initialize game loader
    this.gameLoader = new GameLoader(this.supabase);

    // Initialize PWA installer
    this.pwaInstaller = new PWAInstaller();

    // Set up event listeners
    this.setupEventListeners();

    // Load user session
    await this.loadUserSession();

    // Update UI
    this.updateUI();
  }

  async loadUserSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.currentUser = session?.user || null;

    if (this.currentUser) {
      console.log('User logged in:', this.currentUser.email);
    }
  }

  setupEventListeners() {
    // Game card clicks
    document.querySelectorAll('.game-card[data-game-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const gameId = card.dataset.gameId;
        const gameName = card.dataset.gameName;
        this.loadGame(gameId, gameName);
      });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Category filters
    document.querySelectorAll('.category-tag').forEach(tag => {
      tag.addEventListener('click', () => this.handleCategoryFilter(tag));
    });
  }

  async loadGame(gameId, gameName) {
    try {
      // Track game launch
      if (this.currentUser) {
        await this.trackGameLaunch(gameId);
      }

      // Load game using the game loader
      await this.gameLoader.loadGame(gameId, gameName);
    } catch (error) {
      console.error('Failed to load game:', error);
      alert('Failed to load game. Please try again.');
    }
  }

  async trackGameLaunch(gameId) {
    try {
      await this.supabase.from('game_launches').insert({
        user_id: this.currentUser.id,
        game_id: gameId,
        launched_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track game launch:', error);
    }
  }

  handleSearch(query) {
    const lowerQuery = query.toLowerCase();
    document.querySelectorAll('.game-card').forEach(card => {
      const title = card.querySelector('.game-title')?.textContent.toLowerCase() || '';
      const category = card.querySelector('.game-category')?.textContent.toLowerCase() || '';
      const matches = title.includes(lowerQuery) || category.includes(lowerQuery);
      card.style.display = matches ? 'flex' : 'none';
    });
  }

  handleCategoryFilter(tag) {
    document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
    tag.classList.add('active');

    const category = tag.dataset.category;
    document.querySelectorAll('.game-card').forEach(card => {
      const cardCategory = card.dataset.category || '';
      const matches = category === 'all' || cardCategory.includes(category);
      card.style.display = matches ? 'flex' : 'none';
    });
  }

  updateUI() {
    // Update game count
    const gameCount = document.querySelectorAll('.game-card[data-game-id]').length;
    const gameCountEl = document.getElementById('gameCount');
    if (gameCountEl) {
      gameCountEl.textContent = gameCount;
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new GameHub();
    app.init();
  });
} else {
  const app = new GameHub();
  app.init();
}
