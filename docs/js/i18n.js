/**
 * Internationalization (i18n) system for Xbox Cloud Gaming KB+M website
 * Supports 56 languages matching the browser extension
 */

const I18n = {
  // All supported languages with native names and RTL info
  languages: {
    ar: { name: 'العربية', nativeName: 'العربية', rtl: true },
    bg: { name: 'Bulgarian', nativeName: 'Български' },
    bn: { name: 'Bengali', nativeName: 'বাংলা' },
    ca: { name: 'Catalan', nativeName: 'Català' },
    cs: { name: 'Czech', nativeName: 'Čeština' },
    da: { name: 'Danish', nativeName: 'Dansk' },
    de: { name: 'German', nativeName: 'Deutsch' },
    el: { name: 'Greek', nativeName: 'Ελληνικά' },
    en: { name: 'English', nativeName: 'English' },
    es: { name: 'Spanish', nativeName: 'Español' },
    fa: { name: 'Persian', nativeName: 'فارسی', rtl: true },
    fi: { name: 'Finnish', nativeName: 'Suomi' },
    fil: { name: 'Filipino', nativeName: 'Filipino' },
    fr: { name: 'French', nativeName: 'Français' },
    gu: { name: 'Gujarati', nativeName: 'ગુજરાતી' },
    he: { name: 'Hebrew', nativeName: 'עברית', rtl: true },
    hi: { name: 'Hindi', nativeName: 'हिन्दी' },
    hr: { name: 'Croatian', nativeName: 'Hrvatski' },
    hu: { name: 'Hungarian', nativeName: 'Magyar' },
    id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    it: { name: 'Italian', nativeName: 'Italiano' },
    ja: { name: 'Japanese', nativeName: '日本語' },
    kk: { name: 'Kazakh', nativeName: 'Қазақша' },
    kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    ko: { name: 'Korean', nativeName: '한국어' },
    lt: { name: 'Lithuanian', nativeName: 'Lietuvių' },
    lv: { name: 'Latvian', nativeName: 'Latviešu' },
    ml: { name: 'Malayalam', nativeName: 'മലയാളം' },
    mr: { name: 'Marathi', nativeName: 'मराठी' },
    ms: { name: 'Malay', nativeName: 'Bahasa Melayu' },
    my: { name: 'Burmese', nativeName: 'မြန်မာဘာသာ' },
    nb: { name: 'Norwegian', nativeName: 'Norsk Bokmål' },
    ne: { name: 'Nepali', nativeName: 'नेपाली' },
    nl: { name: 'Dutch', nativeName: 'Nederlands' },
    pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    pl: { name: 'Polish', nativeName: 'Polski' },
    pt_BR: { name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
    pt_PT: { name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)' },
    ro: { name: 'Romanian', nativeName: 'Română' },
    ru: { name: 'Russian', nativeName: 'Русский' },
    sk: { name: 'Slovak', nativeName: 'Slovenčina' },
    sl: { name: 'Slovenian', nativeName: 'Slovenščina' },
    sr: { name: 'Serbian', nativeName: 'Српски' },
    sv: { name: 'Swedish', nativeName: 'Svenska' },
    sw: { name: 'Swahili', nativeName: 'Kiswahili' },
    ta: { name: 'Tamil', nativeName: 'தமிழ்' },
    te: { name: 'Telugu', nativeName: 'తెలుగు' },
    th: { name: 'Thai', nativeName: 'ไทย' },
    tr: { name: 'Turkish', nativeName: 'Türkçe' },
    uk: { name: 'Ukrainian', nativeName: 'Українська' },
    ur: { name: 'Urdu', nativeName: 'اردو', rtl: true },
    vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    zh_CN: { name: 'Chinese (Simplified)', nativeName: '简体中文' },
    zh_TW: { name: 'Chinese (Traditional)', nativeName: '繁體中文' }
  },

  currentLang: 'en',
  translations: {},

  // Initialize i18n system
  async init() {
    // Detect user's preferred language
    const savedLang = localStorage.getItem('preferred-language');
    const browserLang = navigator.language.replace('-', '_');
    const shortLang = browserLang.split('_')[0];

    // Priority: saved > exact browser match > short browser match > English
    if (savedLang && this.languages[savedLang]) {
      this.currentLang = savedLang;
    } else if (this.languages[browserLang]) {
      this.currentLang = browserLang;
    } else if (this.languages[shortLang]) {
      this.currentLang = shortLang;
    } else {
      this.currentLang = 'en';
    }

    // Load translations
    await this.loadTranslations(this.currentLang);

    // Apply translations to page
    this.applyTranslations();

    // Setup language selector
    this.setupLanguageSelector();

    // Set document direction for RTL languages
    this.updateDocumentDirection();
  },

  // Load translations for a language
  async loadTranslations(lang) {
    try {
      const response = await fetch(`locales/${lang}.json`);
      if (response.ok) {
        this.translations = await response.json();
      } else {
        // Fallback to English
        if (lang !== 'en') {
          console.warn(`Translations for ${lang} not found, falling back to English`);
          const fallback = await fetch('locales/en.json');
          this.translations = await fallback.json();
        }
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Use embedded English as final fallback
      this.translations = this.getEnglishFallback();
    }
  },

  // Apply translations to all elements with data-i18n attribute
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.translations[key];

      if (translation) {
        // Check if we should set an attribute instead of text content
        const attr = el.getAttribute('data-i18n-attr');
        if (attr) {
          el.setAttribute(attr, translation);
        } else if (el.tagName === 'TITLE') {
          document.title = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // Update current language display
    const langDisplay = document.querySelector('.current-lang');
    if (langDisplay) {
      langDisplay.textContent = this.currentLang.split('_')[0].toUpperCase();
    }

    // Update html lang attribute
    document.documentElement.lang = this.currentLang.replace('_', '-');
  },

  // Update document direction for RTL languages
  updateDocumentDirection() {
    const langInfo = this.languages[this.currentLang];
    if (langInfo && langInfo.rtl) {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('rtl');
    }
  },

  // Setup the language selector dropdown
  setupLanguageSelector() {
    const dropdown = document.querySelector('.language-dropdown');
    const btn = document.querySelector('.language-btn');

    if (!dropdown || !btn) return;

    // Group languages by region for better organization
    const regions = {
      'Americas': ['en', 'es', 'pt_BR', 'pt_PT', 'fr'],
      'Europe': ['de', 'fr', 'it', 'nl', 'pl', 'ru', 'uk', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl', 'sr', 'el', 'da', 'sv', 'nb', 'fi', 'lt', 'lv', 'ca'],
      'Middle East': ['ar', 'he', 'fa', 'tr', 'ur'],
      'Asia': ['zh_CN', 'zh_TW', 'ja', 'ko', 'hi', 'bn', 'ta', 'te', 'ml', 'kn', 'mr', 'gu', 'pa', 'ne', 'th', 'vi', 'id', 'ms', 'fil', 'my', 'kk'],
      'Africa': ['sw']
    };

    // Create flat list sorted by native name
    const sortedLangs = Object.keys(this.languages).sort((a, b) =>
      this.languages[a].nativeName.localeCompare(this.languages[b].nativeName)
    );

    // Build dropdown HTML
    let html = '<div class="language-search"><input type="text" placeholder="Search languages..." aria-label="Search languages"></div>';
    html += '<div class="language-list">';

    sortedLangs.forEach(code => {
      const lang = this.languages[code];
      const isSelected = code === this.currentLang;
      html += `
        <button class="language-option ${isSelected ? 'selected' : ''}"
                data-lang="${code}"
                role="option"
                aria-selected="${isSelected}"
                ${lang.rtl ? 'dir="rtl"' : ''}>
          <span class="lang-native">${lang.nativeName}</span>
          <span class="lang-english">${lang.name}</span>
          ${isSelected ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : ''}
        </button>
      `;
    });

    html += '</div>';
    dropdown.innerHTML = html;

    // Toggle dropdown
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !isExpanded);
      dropdown.classList.toggle('show');

      if (!isExpanded) {
        // Focus search input when opening
        const searchInput = dropdown.querySelector('input');
        if (searchInput) searchInput.focus();
      }
    });

    // Close on outside click
    document.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      dropdown.classList.remove('show');
    });

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Language selection
    dropdown.addEventListener('click', async (e) => {
      const option = e.target.closest('.language-option');
      if (option) {
        const lang = option.dataset.lang;
        await this.changeLanguage(lang);
        btn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('show');
      }
    });

    // Search functionality
    const searchInput = dropdown.querySelector('input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        dropdown.querySelectorAll('.language-option').forEach(option => {
          const native = option.querySelector('.lang-native').textContent.toLowerCase();
          const english = option.querySelector('.lang-english').textContent.toLowerCase();
          const matches = native.includes(query) || english.includes(query);
          option.style.display = matches ? '' : 'none';
        });
      });
    }

    // Keyboard navigation
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  },

  // Change language
  async changeLanguage(lang) {
    if (!this.languages[lang]) return;

    this.currentLang = lang;
    localStorage.setItem('preferred-language', lang);

    await this.loadTranslations(lang);
    this.applyTranslations();
    this.updateDocumentDirection();

    // Update selector UI
    document.querySelectorAll('.language-option').forEach(option => {
      const isSelected = option.dataset.lang === lang;
      option.classList.toggle('selected', isSelected);
      option.setAttribute('aria-selected', isSelected);

      // Update checkmark
      const existingCheck = option.querySelector('.fa-check');
      if (isSelected && !existingCheck) {
        option.insertAdjacentHTML('beforeend', '<i class="fa-solid fa-check" aria-hidden="true"></i>');
      } else if (!isSelected && existingCheck) {
        existingCheck.remove();
      }
    });

    // Announce language change to screen readers
    this.announceToScreenReader(`Language changed to ${this.languages[lang].name}`);
  },

  // Announce message to screen readers
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => announcement.remove(), 1000);
  },

  // English fallback translations (embedded for reliability)
  getEnglishFallback() {
    return {
      pageTitle: "Xbox Cloud Gaming KB+M - Play with Keyboard and Mouse",
      metaDescription: "Play Xbox Cloud Gaming with keyboard and mouse. Free Chrome extension with customizable key bindings, sensitivity curves, game profiles, and macro recording.",
      skipToContent: "Skip to main content",
      navFeatures: "Features",
      navHowItWorks: "How It Works",
      navPresets: "Preset Library",
      heroTitle: "Play Xbox Cloud Gaming with Keyboard + Mouse",
      heroTagline: "Transform your xCloud experience with precise keyboard and mouse controls. Free, open-source, and fully customizable.",
      downloadBtn: "Download from GitHub",
      browsePresetsBtn: "Browse Presets",
      featuresTitle: "Features",
      featureKeyboardTitle: "Full Keyboard Support",
      featureKeyboardDesc: "Use any key on your keyboard to control movement, actions, and menus. WASD moves, Space jumps, and everything is customizable.",
      featureMultiKeyTitle: "Multi-Key Bindings",
      featureMultiKeyDesc: "Bind multiple keys to the same action. Use both Space and Enter for the A button, or create comfortable alternatives.",
      featureMouseTitle: "Mouse Aiming",
      featureMouseDesc: "Precise mouse control for camera and aiming. Click in the game to lock your cursor and start aiming.",
      featureProfilesTitle: "Game Profiles",
      featureProfilesDesc: "Create different profiles for different games. Auto-switch profiles when you launch specific games.",
      featureCurvesTitle: "Sensitivity Curves",
      featureCurvesDesc: "Choose linear, exponential, or S-curve sensitivity. Adjust deadzone for perfect control feel.",
      featureMacroTitle: "Macro Recording",
      featureMacroDesc: "Record button sequences with timing and replay them with a single key press. Perfect for combos.",
      featureCloudTitle: "Cloud Sync",
      featureCloudDesc: "Your settings sync across devices via Chrome. Set up once, play anywhere with the same configuration.",
      featureOverlayTitle: "On-Screen Overlay",
      featureOverlayDesc: "See your current profile and status with a minimal overlay. Drag to reposition or hide completely.",
      howItWorksTitle: "How It Works",
      step1Title: "Install Extension",
      step1Desc: "Add the extension to Chrome or Edge from the browser store. It's free and open-source.",
      step2Title: "Open Xbox Cloud Gaming",
      step2Desc: "Go to xbox.com/play and start any game. The extension activates automatically.",
      step3Title: "Click to Lock Mouse",
      step3Desc: "Click on the game stream to lock your mouse for camera control. Press Escape to unlock.",
      browserSupportTitle: "Browser Support",
      browserSubtitle: "Works with any Chromium-based browser",
      presetCtaTitle: "Ready-Made Presets",
      presetCtaDesc: "Browse community-created profiles for popular games. One-click install directly into your extension.",
      presetCtaBtn: "Browse Preset Library",
      footerReportBug: "Report a Bug",
      footerPresets: "Preset Library",
      footerDisclaimer: "Open-source project. Not affiliated with Microsoft or Xbox."
    };
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
  I18n.init();
}
