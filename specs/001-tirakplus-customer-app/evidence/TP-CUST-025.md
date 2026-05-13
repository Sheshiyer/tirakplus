# Evidence for TP-CUST-025: Desktop Nav Rail

## Contract Proof
- `TopNav.tsx` implements a soft floating rail on desktop through `.top-nav` and theme CSS classes.
- Includes a primary action slot (`action`).
- Correct font sizing and active states are defined in `src/app/styles.css`.
- Includes light and dark themes.

## Anti-Pattern Checklist Evidence
- [x] Restrained links without excessive drop-downs or megamenus.
- [x] Uses soft background blur without aggressive gradients.
- [x] Asymmetric space usage aligns with the design standard.
