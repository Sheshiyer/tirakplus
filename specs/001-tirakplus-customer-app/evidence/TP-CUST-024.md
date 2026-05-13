# Evidence for TP-CUST-024: Mobile Bottom Nav

## Contract Proof
- `BottomNav.tsx` uses the `.bottom-nav` CSS contract and is shown by the app stylesheet on mobile viewports.
- Respects safe area insets through `padding-bottom: env(safe-area-inset-bottom)`.
- Has touch targets greater than 44px through `.bottom-nav-link`.
- Implements active states via `NavLink` with bolding.
- Simple, non-decorative SVG icons were added via `Icons.tsx` to Public, Traveller, and Companion shells.

## Anti-Pattern Checklist Evidence
- [x] Simple bottom tab bar following standard iOS/Android conventions.
- [x] No complex nesting or non-standard interactions.
- [x] Clean and professional icons avoiding gaming or dating cliches.
