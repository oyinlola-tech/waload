# WaLoad (VTU) — Static Frontend

**Project Overview**
- A small static VTU (virtual top-up) demo app implemented with HTML, CSS and vanilla JavaScript. It simulates common wallet features: balance display, deposit, withdraw, transfer, a services grid (recharge, data, electricity, TV, refer), history, and a profile page.
- All state is persisted to `localStorage`, so data survives page refresh for the same browser/profile.

**What’s Included**
- `index.html` — main UI and components (balance, services, history preview, modals)
- `css/styles.css` — styles and layout
- `js/script.js` — all frontend logic: balance toggle, deposit/withdraw/transfer, profile storage, history rendering
- `features/` — (if present) profile/history feature pages (linked from main UI)

**Quick Start**
1. Open the project in your editor.
2. Serve the folder or open `index.html` directly in a browser.

To run a local static server (recommended):

PowerShell (Python 3):

```powershell
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

If you have Node.js installed, you can use `serve`:

```powershell
npx serve -s . -l 8000
# or install: npm i -g serve; serve -s . -l 8000
```

**Main Features & Usage**
- Balance
  - Shows `Total Balance` at top of the page. Click the eye button to hide/show the amount.
  - The balance value is stored and updated in memory and `localStorage` via transactions.

- Deposit / Withdraw / Transfer
  - Click `Deposit` to open the transaction modal in deposit mode.
  - Click the `Transfer` service tile (or any other wired button) to open the transaction modal in `transfer` mode. Transfer mode displays a `Recipient` field where you must enter a phone/account identifier.
  - Withdraw button (if available) opens withdraw mode.
  - Submitting transactions validates numeric amounts and ensures sufficient balance (for withdraw/transfer). Transactions are saved to `localStorage` under `vtu_transactions`.

- Services grid
  - Displays service tiles: Recharge, Data Bundle, Transfer, Electricity, TV, Refer & Earn.
  - Tiles are static by default; the `Transfer` tile is wired to open the transfer modal.

- History
  - Transactions are saved and rendered in `features/history.html` (and a history preview in `index.html`). Transaction objects are stored in `vtu_transactions`.

- Profile
  - Profile data saved under `vtu_profile`; profile editing, cards (`vtu_cards`) and limits (`vtu_limits`) are handled on the profile page.

**localStorage Keys and Schemas**
- `vtu_profile` — object, example:

```json
{
  "name": "Jane Doe",
  "phone": "+2348010000000",
  "email": "jane@example.com"
}
```

- `vtu_transactions` — array of transaction objects (most recent first). Example entry:

```json
{
  "id": 1670000000000,
  "type": "transfer", // 'deposit', 'withdraw', 'transfer', 'payment', etc.
  "name": "Transfer to +2348010000000",
  "amount": 1000,
  "date": "2025-11-18T12:34:56.789Z"
}
```

- `vtu_cards` — array of saved cards (brand, last4, exp)
- `vtu_limits` — object with `per` and `daily` numeric limit values

**Code Walkthrough**
- `js/script.js` contains three IIFEs that scope code by page/functionality:
  - Index page logic: balance toggle, deposit/withdraw/transfer modal, transaction saving, services interaction.
  - Profile page logic: load/save `vtu_profile`, cards management, limits editing.
  - History page logic: reads `vtu_transactions` and renders them into history list.

Key helper utilities in `js/script.js`:
- `qs(id)` and `q(sel)` helpers for element selection.
- `parseCurrency` / `formatCurrency` for consistent formatting.
- `saveTransaction(tx)` — appends transaction to `vtu_transactions` in `localStorage`.

Transaction modal behavior (quick summary):
- Modal uses `#transactionModalBackdrop`, `#txTitle`, `#txAmount`, `#txRecipient` (recipient shown only for `transfer` mode), and `#txSubmit` button with `data-mode` (deposit/withdraw/transfer).
- When `data-mode==='transfer'` modal validates a recipient string and amount, debits the balance, and saves `type: 'transfer'` transaction.

**Accessibility & UX Notes**
- Interactive controls have `aria-` attributes like `aria-pressed`, `aria-expanded` (removed for the 'More' toggle now inlined).
- Buttons are reachable by keyboard and have focus outlines (CSS rules added).

**Styling / Layout**
- `css/styles.css` provides a mobile-friendly single-column layout limited to 500px.
- Utility classes: `.hidden` is used to hide elements (e.g., recipient row when not in transfer mode).
- Services grid uses CSS Grid: 4 columns by default; you can adjust `grid-template-columns` to change layout.

**Extending the App**
- Add click handlers for other service tiles:
  - Example: wire the TV tile by adding an `id` and a small handler in `js/script.js` to navigate or open a modal.

```js
var tvBtn = document.getElementById('serviceTv');
if(tvBtn) tvBtn.addEventListener('click', function(){ window.location.href = 'features/tv.html'; });
```

- To change which tiles are visible, edit `index.html`'s `.services-grid` markup; to change layout, update `css/styles.css`.

**Troubleshooting**
- If changes to `js/script.js` don't run, clear the browser cache or do a hard reload.
- If `localStorage` appears empty, confirm you are running the files under the same domain/port (browsers treat `file://` origins differently for storage/security). Using a local server avoids cross-origin quirks.

**Next Steps / Suggestions**
- Add a confirmation step for transfers (two-step flow) with a transaction review.
- Add input validation for `Recipient` (phone number normalization) and show recent contacts.
- Add tests or a small harness to simulate transactions during development.
- Consider adding a small backend (or mock server) to persist data beyond `localStorage`.

**Contact / Contribution**
- This repo is a static demo. To propose changes, fork and submit PRs. If you want me to implement a feature (e.g., two-step transfer, TV purchase flow, or a small server backend), say which feature and I will scaffold it.

---

README generated and placed at the project root. If you'd like it expanded with screenshots, example flows, or API spec for a backend, tell me which sections to prioritize.