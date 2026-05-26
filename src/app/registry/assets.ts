/**
 * Asset Usage Registry
 * TP-CUST-010
 *
 * Central registry for all visual assets in the Tirak Plus customer application.
 * Ensures we don't hardcode cheap dating-app patterns or low-quality fallback
 * imagery in the UI components, and provides a structured way to resolve
 * asset references returned by the API.
 *
 * Source of truth for approved generated assets:
 *   /Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/
 * Promotion to public/assets/ is owned by scripts/asset-staleness-audit.mjs (UIR-057).
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
    // App icon export family (UIR-034 / promoted 2026-05-22 from
    // generated/muse-assets/gpt-image-2/app-icon-exports/)
    iconExports: {
      'icon-32': '/assets/brand/icon-exports/icon-32.png',
      'icon-64': '/assets/brand/icon-exports/icon-64.png',
      'icon-128': '/assets/brand/icon-exports/icon-128.png',
      'icon-180': '/assets/brand/icon-exports/icon-180.png',
      'icon-192': '/assets/brand/icon-exports/icon-192.png',
      'icon-256': '/assets/brand/icon-exports/icon-256.png',
      'icon-512': '/assets/brand/icon-exports/icon-512.png',
      'icon-1024': '/assets/brand/icon-exports/icon-1024.png',
    },
  },

  // Safe, premium fallbacks (private Tirak style, not dating-app)
  fallbacks: {
    companionProfile: '/assets/profiles/companion-aura.png',
    travellerProfile: '/assets/brand/tirakplus-muse-icon-192.png',
    hero: '/assets/muse/scene/muse-thailand-night-backdrop.png',
  },

  // Companion avatar staged-data assets used by src/worker/staged-data.ts.
  // Registered here so asset-staleness-audit.mjs has a single source of truth.
  // The worker references these by string path; thread this map through if/when
  // staged-data.ts moves into a shared module (out of scope for asset migration).
  companionProfiles: {
    aura: '/assets/profiles/companion-aura.png',
    mali: '/assets/profiles/companion-mali.png',
    nara: '/assets/profiles/companion-nara.png',
    sora: '/assets/profiles/companion-sora.png',
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
    // A2 — Floating Muse mark (abstract, ambient presence on every protected route).
    // Source: generated/muse-3d/{exports/manifest.json,keyframes/*.png}
    // Wave 1 ships PNG keyframes; Wave 2 adds the GLB clip pipeline.
    floating: {
      appearStart: '/assets/muse/floating/muse-appear-start.png',
      appearEnd: '/assets/muse/floating/muse-appear-end.png',
      idleStart: '/assets/muse/floating/muse-idle-float-start.png',
      idleEnd: '/assets/muse/floating/muse-idle-float-end.png',
      listenStart: '/assets/muse/floating/muse-listen-start-start.png',
      listenEnd: '/assets/muse/floating/muse-listen-start-end.png',
      privacyLockStart: '/assets/muse/floating/muse-privacy-lock-start.png',
      privacyLockEnd: '/assets/muse/floating/muse-privacy-lock-end.png',
    },
    scene: {
      backdrop: '/assets/muse/scene/muse-thailand-night-backdrop.png',
      foreground: '/assets/muse/scene/muse-desktop-portrait-foreground-alpha.png',
      mobilePortrait: '/assets/muse/scene/muse-mobile-portrait-foreground-alpha.png',
      tabletPortrait: '/assets/muse/scene/muse-tablet-portrait-foreground-alpha.png',
      desktopPortrait: '/assets/muse/scene/muse-desktop-portrait-foreground-alpha.png',
      // Per-page immersive backdrops generated 2026-05-26 via gpt-image-2,
      // brand-true rooftop-dusk + morning-suite scenes; the Muse pose PNG
      // overlays each with parallax depth.
      discoveryBackdrop: '/assets/muse/scene/muse-discovery-rooftop-dusk.png',
      safetyBackdrop: '/assets/muse/scene/muse-safety-morning-suite.png',
    },
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
