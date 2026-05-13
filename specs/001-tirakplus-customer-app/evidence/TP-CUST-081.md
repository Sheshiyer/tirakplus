# Evidence for TP-CUST-081: Inquiry Unavailable State

## Contract Proof
- Inquiry page reuses profile fetch and unavailable handling before showing the form.
- Restricted profiles cannot receive inquiries through `POST /api/traveller/inquiries`.

## Anti-Pattern Checklist Evidence
- [x] Unavailable state blocks routing safely without leaking restricted profile data.
