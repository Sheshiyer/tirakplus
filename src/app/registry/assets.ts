/**
 * Asset Usage Registry
 * TP-CUST-010
 * 
 * Central registry for all visual assets in the Tirak Plus customer application.
 * Ensures we don't hardcode cheap dating-app patterns or low-quality fallback
 * imagery in the UI components, and provides a structured way to resolve 
 * asset references returned by the API.
 */

export const AssetRegistry = {
  // Brand assets
  brand: {
    logoPrimary: '/assets/brand/logo-primary.svg',
    logoWhite: '/assets/brand/logo-white.svg',
    appIcon: '/assets/brand/app-icon.png',
    museMark: '/assets/brand/muse-mark.png',
    tirakPlusMuseAppIcon: '/assets/brand/tirakplus-muse-app-icon.png',
    tirakPlusMuseIcon192: '/assets/brand/tirakplus-muse-icon-192.png',
  },
  
  // Safe, premium fallbacks (private Tirak style, not dating-app)
  fallbacks: {
    companionProfile: '/assets/profiles/companion-aura.png',
    travellerProfile: '/assets/brand/tirakplus-muse-icon-192.png',
    hero: '/assets/muse/scene/muse-thailand-night-backdrop.png',
  },

  // Premium imagery for cities
  cities: {
    bangkok: '/assets/cities/bangkok-premium.jpg',
    phuket: '/assets/cities/phuket-premium.jpg',
    kohSamui: '/assets/cities/koh-samui-premium.jpg',
    kohPhangan: '/assets/cities/koh-phangan-premium.jpg',
  },

  // Premium imagery for experiences
  experiences: {
    nightlife: '/assets/experiences/nightlife-premium.jpg',
    islandExplorer: '/assets/experiences/island-explorer-premium.jpg',
    muayThai: '/assets/experiences/muay-thai-premium.jpg',
    privateDining: '/assets/experiences/private-dining-premium.jpg',
  },

  // Trust and Safety visuals
  trustAndSafety: {
    verifiedBadge: '/assets/trust/verified-badge.svg',
    safetyShield: '/assets/trust/safety-shield.svg',
  },

  muse: {
    scene: {
      backdrop: '/assets/muse/scene/muse-thailand-night-backdrop.png',
      foreground: '/assets/muse/scene/muse-splash-foreground-hero-alpha.png',
    },
    poses: {
      splash: '/assets/muse/scene/muse-splash-foreground-hero-alpha.png',
      chat: '/assets/muse/png-poses/muse-chat-attentive.png',
      privacy: '/assets/muse/png-poses/muse-privacy-guarded.png',
      companion: '/assets/muse/png-poses/muse-companion-presenting.png',
      thinking: '/assets/muse/png-poses/muse-loading-thinking.png',
    },
    referenceBoard: '/assets/muse/png-poses/muse-splash-character.png',
  },

  /**
   * Resolves an API asset reference to a concrete URL or fallback.
   * Maintains Tirak's premium, respectful visual standards.
   */
  resolveAsset(type: 'profile' | 'city' | 'experience' | 'trust' | 'hero', ref?: string): string {
    if (!ref) {
      if (type === 'profile') return this.fallbacks.companionProfile;
      if (type === 'hero') return this.fallbacks.hero;
      if (type === 'city') return this.cities.bangkok;
      if (type === 'experience') return this.experiences.privateDining;
      if (type === 'trust') return this.trustAndSafety.safetyShield;
      return '';
    }

    // Resolve mapped keys or return the provided URL/path directly
    if (type === 'city' && ref in this.cities) {
      return this.cities[ref as keyof typeof this.cities];
    }
    
    if (type === 'experience' && ref in this.experiences) {
      return this.experiences[ref as keyof typeof this.experiences];
    }

    return ref;
  }
};
