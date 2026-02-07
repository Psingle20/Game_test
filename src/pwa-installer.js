// PWA Installation Manager
export class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.isIOS = this.detectIOS();
    this.isAndroid = this.detectAndroid();
    this.isStandalone = this.detectStandalone();
    this.init();
  }

  detectIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  detectAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  detectStandalone() {
    return window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches;
  }

  init() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.updateInstallUI();
    });

    // Show PWA section if not installed
    if (!this.isStandalone) {
      this.showPWASection();
    }

    // Set up install button
    const installBtn = document.getElementById('pwa-action-btn');
    if (installBtn) {
      installBtn.addEventListener('click', () => this.handleInstallClick());
    }
  }

  showPWASection() {
    const section = document.getElementById('pwa-section');
    const steps = document.getElementById('pwa-steps');
    const btn = document.getElementById('pwa-action-btn');
    const desc = document.getElementById('pwa-desc');

    if (!section) return;

    if (this.isIOS) {
      desc.textContent = 'iOS requires installing the app for fullscreen gaming!';
      steps.innerHTML = '1. Tap the <b>Share button</b> ⎋ (bottom of Safari)<br>' +
        '2. Scroll down and tap <b>"Add to Home Screen"</b><br>' +
        '3. Tap <b>"Add"</b><br>' +
        '4. Open GameHub from your home screen';
      btn.textContent = 'I UNDERSTAND';
    } else if (this.isAndroid) {
      desc.textContent = 'Install for fullscreen gaming with no browser bars!';
      steps.innerHTML = 'Tap <b>INSTALL NOW</b> below, or use browser menu → <b>"Install app"</b>';
      btn.textContent = 'INSTALL NOW';
    } else {
      desc.textContent = 'Install the app for the best experience!';
      steps.innerHTML = 'Click the install icon in your browser address bar, or use menu → <b>"Install app"</b>';
      btn.textContent = 'INSTALL';
    }

    section.style.display = 'block';
  }

  updateInstallUI() {
    const btn = document.getElementById('pwa-action-btn');
    if (btn && !this.isIOS) {
      btn.textContent = 'INSTALL NOW';
    }
  }

  async handleInstallClick() {
    if (this.deferredPrompt && !this.isIOS) {
      // Show native install prompt
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`User ${outcome} the install prompt`);
      this.deferredPrompt = null;
    } else if (this.isIOS) {
      // Scroll to top to show share button
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
