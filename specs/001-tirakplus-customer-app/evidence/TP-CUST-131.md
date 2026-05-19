# TP-CUST-131 Evidence: Keyboard Navigation Customer

- Added skip links to public, traveller, and companion shells.
- Added `main#main-content` landmarks with `tabIndex={-1}` in all three shells.
- Added global `:focus-visible` treatment plus specific focus styles for nav links, buttons, inputs, checkboxes, code inputs, and Muse prompt controls.
- Anti-pattern check: keyboard support keeps the flow accessible without adding manipulative browse or urgency mechanics.
