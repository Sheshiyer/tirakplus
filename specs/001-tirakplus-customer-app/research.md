
# Research: Tirak Plus Customer App

## Decision: Use awesome-design-md structure for DESIGN.md

**Rationale**: The referenced collection standardizes design docs into visual theme, colors, typography, components, layout, depth, do/don't, responsive behavior, and agent prompts. Tirak needs exactly that because future agents must avoid cheap dating-app defaults.

**Alternatives considered**:

- Keep the existing shorter DESIGN.md: rejected because it did not fully cover depth/elevation, responsive behavior, or agent prompt guidance.
- Use a copied third-party brand file: rejected because Tirak needs its own adult companion/hospitality posture.

## Decision: Use spec-kit artifacts as implementation source of truth

**Rationale**: Spec-kit provides constitution, spec, plan, tasks, and issue conversion conventions. The product has high brand/safety risk and benefits from spec-first control.

**Alternatives considered**:

- Single TODO file: rejected because 225 detailed issues require traceability and validation.
- Jump directly to app scaffolding: rejected because design, API rails, and responsive behavior must be frozen first.

## Decision: Current generated assets are references only

**Rationale**: The app icon and icon sheet are strong direction. The brand board includes generated UI text and a generated lifestyle portrait, so it is staging guidance only.

**Alternatives considered**:

- Ship generated images directly: rejected until human review and production usage rules exist.
- Ignore generated assets: rejected because they establish useful Tirak mark geometry and palette direction.

## Decision: API-shaped staged data before UI implementation

**Rationale**: The user explicitly requires no mock data hardcoded in components. Staged data through API rails allows production transition with fewer UI changes.

**Alternatives considered**:

- Component-local arrays: rejected as constitution violation.
- Production database first: rejected for this planning pass because contracts should be frozen before infrastructure implementation.

## Decision: Customer app prioritizes discreet concierge experience over swipe-first discovery

**Rationale**: The customer brand must be premium and respectful, avoiding dating-directory patterns and objectifying discovery.

**Alternatives considered**:

- Generic dating marketplace: rejected because it would directly violate brand strategy and companion agency goals.
