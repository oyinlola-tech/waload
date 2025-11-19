# WaLoad (VTU) — Static Frontend

**Project Overview**
- A small static VTU (virtual top-up) demo app implemented with HTML, CSS and vanilla JavaScript. It simulates common wallet features: balance display, deposit, withdraw, transfer, a services grid (recharge, data, electricity, TV, refer), history, and a profile page.
- All state is persisted to `localStorage`, so data survives page refresh for the same browser/profile.

**What’s Included**
- `index.html` — main UI and components (balance, services, history preview, modals)
- `css/styles.css` — styles and layout (mobile-first; see `:root` variables for `--app-max-width`)
- `js/script.js` — all frontend logic: balance toggle, deposit/withdraw/transfer, profile storage, history rendering, plus the centralized rewards/calendar/coupons logic
- `features/` — supplemental pages: `features/rewards.html`, `features/profile.html`, `features/history.html`

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

**Recent Changes (Nov 2025)**
- Removed the redundant "Finance" / "Fiance" bottom navigation item across pages (now: Home, Rewards, Me).
- Rewards system centralized into `js/script.js`: daily check-in calendar (clickable), month navigation (prev/next), streak tracking, and reward granting.
- Coupons and cashback logic moved into `js/script.js` and now render inside `features/rewards.html` via markup hooks (`#rewardsCashback`, `#couponsList`, etc.).
- Layout tuned for mobile: new CSS variables in `css/styles.css` include `--app-max-width` (default set to 430px for a mobile target), `--bottom-nav-height`, and `--topbar-height` to keep the header and content aligned with the fixed bottom nav.

**Main Features & Usage**
- Balance
  - Shows `Total Balance` at top of the page. Click the eye button to hide/show the amount.
  - The balance value is stored and updated by transactions in `localStorage`.

- Transactions (Deposit / Withdraw / Transfer)
  - Transaction flows live in `js/script.js`. Transactions are validated and saved to `vtu_transactions`.

- Rewards (new)
  - Daily Check-in
    - Visit `features/rewards.html` to view the calendar and your streak (`#streakInfo`).
    - Click a day (or use `Check in Today`) to claim the daily reward. The logic is in `js/script.js`.
    - Streaks are tracked in `localStorage` using `rewards_streak` and individual check-ins are saved under `rewards_checkins`.
    - Base daily reward and streak bonuses are defined in `js/script.js` as constants (you can edit them there): `CHECKIN_BASE_REWARD`, `STREAK_BONUSES`.

  - Cashback & Coupons
    - Unclaimed cashback (1% on eligible spend) is shown in `#rewardsCashback`. Claiming cashback creates a `reward` transaction.
    - Coupons are generated from eligible transactions (spend >= ₦1,000) and saved to `vtu_coupons`. Use the Apply button next to a coupon to add its value as a `coupon` transaction.

**Files Changed / Important Hooks**
- `features/rewards.html` — contains markup hooks used by `js/script.js`:
  - `#checkinCalendar` — container for the calendar grid
  - `#prevMonth`, `#nextMonth` — month navigation
  - `#monthTitle` — current month header
  - `#streakInfo` — streak display
  - `#checkinToday` — quick check-in button
  - `#rewardsCashback`, `#claimCashback` — cashback display and claim action
  - `#couponsList` — rendered coupon list
- `js/script.js` — centralized logic: calendar rendering, `attemptCheckin(isoDate)`, `grantReward(amount,note)`, cashback & coupons manager, and general page behaviors.
- `css/styles.css` — added layout variables and calendar styles. Adjust `--app-max-width` to change the app's centered width (useful for pixel-matching a target device).
- `features/profile.html` — sections were refactored so each logical block is wrapped in a `.section` for consistent spacing.

**localStorage Keys (new / updated)**
- `vtu_transactions` — array of transactions (existing)
- `vtu_coupons` — array of generated coupons (code, txId, value, used)
- `rewards_checkins` — object keyed by ISO date strings for check-in status
- `rewards_streak` — object that stores `lastDate` and `count` for the user's current streak

**Config & Customization**
- To change the app's visual width, edit `:root { --app-max-width: 430px; }` in `css/styles.css`.
- To change check-in rewards or streak bonus thresholds, open `js/script.js` and update the constants near the calendar module (look for `CHECKIN_BASE_REWARD` and `STREAK_BONUSES`).
- Retroactive check-ins: the system currently allows only same-day check-ins through the UI. If you want a retroactive window (e.g., allow yesterday or N days), I can implement that — tell me the desired policy.

**Testing / Verification**
- Recommended: run a local server and open `http://localhost:8000/features/rewards.html` in a mobile-sized viewport (~430px) to validate layout and interactive behavior.
- Quick manual tests:
  - Click several days in the calendar and verify `rewards_checkins` in the browser DevTools `Application > Local Storage` pane.
  - Claim cashback and apply a coupon; confirm new entries in `vtu_transactions`.

**Troubleshooting**
- If calendar or rewards aren't visible, ensure `js/script.js` is loaded (check browser console for errors).
- If transactions or coupons don't persist, confirm you're testing on the same origin (use the local server recommended above).

**Next Steps / Suggestions**
- Implement retroactive check-in policy (configurable window).
- Expose a small admin UI in `features/profile.html` to tweak `CHECKIN_BASE_REWARD` and `STREAK_BONUSES` without editing JS.
- Add visual tests or screenshots to the README for easier QA.

**Contact / Contribution**
- This repo is a static demo. To propose changes, fork and submit PRs. If you want me to implement a feature (retroactive check-ins, admin UI for reward config, or visual QA fixes), tell me which feature and I will implement it.

---

README updated to reflect rewards/calendar and layout changes. If you'd like screenshots, example flows, or a step-by-step test harness, tell me which to add next.