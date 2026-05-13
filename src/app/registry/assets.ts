/**
 * Asset Usage Registry
 * TP-CUST-010
 * 
 * Central registry for all visual assets in the Tirak Plus customer application.
 * Ensures we don't hardcode cheap dating-app patterns or low-quality placeholder 
 * imagery in the UI components, and provides a structured way to resolve 
 * asset references returned by the API.
 */

export const AssetRegistry = {
  // Brand assets
  brand: {
    logoPrimary: '/assets/brand/logo-primary.svg',
    logoWhite: '/assets/brand/logo-white.svg',
    appIcon: '/assets/brand/app-icon.png',
  },
  
  // Safe, premium placeholders (private concierge style, not dating-app)
  placeholders: {
    companionProfile: '/assets/placeholders/companion-premium-fallback.jpg',
    travellerProfile: '/assets/placeholders/traveller-premium-fallback.jpg',
    hero: '/assets/placeholders/hero-premium-fallback.jpg',
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

  /**
   * Resolves an API asset reference to a concrete URL or fallback.
   * Maintains Tirak's premium, respectful visual standards.
   */
  resolveAsset(type: 'profile' | 'city' | 'experience' | 'trust' | 'hero', ref?: string): string {
    if (!ref) {
      if (type === 'profile') return this.placeholders.companionProfile;
      if (type === 'hero') return this.placeholders.hero;
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
