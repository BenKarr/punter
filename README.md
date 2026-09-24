# punter PWA (build p.15)

Open `index.html` and it runs in demo mode immediately (data saved on this device).
Add your Firebase config in `firebase-config.js` and deploy to switch on real cloud sync.

## Run it now (no setup)
Open index.html in a browser, tap "Continue in demo mode". Add, edit, status, tags, outreach all work and persist locally.

## Go live (cloud sync across phone + desktop)
1. Paste your Firebase config into `firebase-config.js`.
2. Push this folder to a GitHub repo, enable GitHub Pages (Settings > Pages > deploy from branch, root).
3. Open the Pages URL on your iPhone in Safari, Share > Add to Home Screen.


## p.16
- Value flag: Off / £▲ Expensive / £▼ Value seg on contact detail (syncs to NG as val), £ chips on rows, Expensive and Value filter pills on contacts list.
- Auto-unpin: any move to archived or accomplished clears the pin (swipe archive, bulk archive, status No and Move to all covered).
- Duplicate generations from ng.04 show a G2/G3 chip next to the number on rows.


## p.17
- City scope: city derived once per contact from stored geo against a static UK+RO city-center table (no API calls), written as city (string or null). Backfill runs automatically after sync snapshots.
- City pill bar under the country bar scopes contacts list, batch outreach audience and map. Selection persists (punter_city).
- Out-of-scope actives collapse into a tappable Elsewhere row instead of hiding.
- Home: Where the pipeline is card, per city untouched + good-value counts and time since last send; tapping a row jumps to that city's active list.
- Rows show a city chip when scope is All. city syncs to NG (ng.05).


## p.18
- Picture-first contact cards: full uncropped photo on top (object-fit contain, max 320px), photo count and pin overlaid, all chips and swipe actions preserved. No-photo contacts get a compact gradient banner.
- Outreach: full uncropped image, carousel of ALL photos with arrows and counter, whole card taps through to contact detail (arrows excepted).
- Proper back-navigation stack replacing the single _returnScreen slot. Tabs reset the stack, photo viewer close returns to wherever it was opened from, scroll positions restored per screen. Fixes back landing in the image viewer and outreach-detail-photo loops.


## p.19
- Contact list back to the compact row layout (density fix, ~4-5 rows per screen). Thumb upgraded: 104px, uncropped via contain on dark backing, photo count badge kept. Full uncropped photos live in the detail carousel and outreach card. Nav stack and outreach changes from p.18 unchanged.


## p.20
- Portugal support: PT country chip and flag (+351), seven PT city centers (Lisboa r30, Porto r20 covering Gaia/Maia/Matosinhos, Braga, Coimbra, Faro, Setubal, Aveiro) in the city table for scope, planner and map.


## p.21
- NAT service flag from PT sites: NAT chip on rows (matched phrase in the tooltip and in all-details), NAT filter pill.
- Ad lifecycle dates from rua69: published/updated/expires in all-details, row chip 'exp Nd' when under 3 days and 'expired' when past, Expired filter pill for culling dead ads.

## p.34
- Send time: `launchWa` / `waLink` prefixed 44 to any 0-leading stored number, so a Thai contact stored nationally sent to +44. Now `intlOfNational`: 10 digits 06/08/09 → 66, 11 digits 07 → 44, 9 digits 9x → 351.
- Same inference in `toE164P` when there is no contact context (Add contact screen now normalises before saving; refuses unreadable input with a hint), and in `_ctry` (10-digit 0[689] shows TH not UK).
- "Number and rates" is a 44px amber button in the Rates section (was 11px text).

## p.33
- Bug: adding a number to a Thai contact that had no number yet went through the UK default (0646650815 → +44646650815) because "is Thai" was derived from the existing number. Now `isThaiC(c)` (site, tf: handle, country, or existing +66) drives `toE164P`; a Thai contact never gets a +44 guess, and "+0..." input is treated as national. One-off `repairThaiNumbers()` after sign-in fixes contacts already mangled (+44 6/8/9... on a Thai contact, or +0...).

## p.32
- +91 → IN country chip (peach).

## p.31
- `fmtNum`: +66 shows as 095 230 8748 and +351 as 911 571 727 (UK already 07700 900123). Country chip for +66 was already TH.

## p.30
- Contact detail: full-width dark Back bar at the top ("Back to Active / On hold / Home / Burst", position "3 / 8", edit icon on the right); floating circles removed.
- Carousel: swipe left/right; tap left third = previous, right third = next, middle = open viewer on the visible photo; arrows 44px; hidden slides `pointer-events:none` (this was the "tap opens the last photo" bug); thumbnail strip taps move the carousel.
- Photo viewer: 48px X top left, swipe down closes, swipe left/right steps, arrows 44px, count next to the X.
- Navigation: `go()` pushes a history state, phone back gesture pops (sheets close first), swipe right from the left edge (start x ≤ 24px, move > 80px) does the same.

## p.29
- Hold decisions locked: held contacts stay visible in Done and Archived (marker), hidden from Active and AO. Hold sheet with reason pick-list (Went quiet, Not now, Too far, Price, Wait for reply, Other) → `holdReason`. Release sheet picks the category (previous one marked "was here"). Hold list sort bar: Newest, Oldest, Status, Reason (`punter_holdsort`). Swipe-left gets a third Hold action (rows swipe to 210px when present). Detail: full-width amber Hold button under the notes/rates area, shows reason and age of hold, tap to release.

## p.28
- On hold: `hold: true` + `holdAt` on a contact, independent of category. Held contacts leave Active / AO / Done / Archived lists, counts, burst and the outreach queue, and appear only under the new Hold tab (contacts) and "On hold" entry (home), newest held first, with a "held Nd" chip and their real status. Country / city / age bars filter the hold list like any other. Detail has an On hold switch above Move to; releasing returns the contact to its category. Syncs through `hold` / `holdAt`.

## p.27
- Settings > Cloud backup row: live read of `users/<uid>/backup/meta` (written by NG). Shows last time, contacts, size; amber + "stale" after 2 days; red if none; error text if the doc cannot be read (Firestore rules).

## p.26
- Templates carry a scope (country code, site name or blank = default). Burst and the WA button pick the template automatically: site match, then country, then starred default; picking one in the burst screen overrides for that batch. Scope chip shown in Settings > Templates; editor has a Scope select.
- Seeds: default, PT ("Olá, vi o teu anúncio. Estás disponível agora?"), UK incall line, Thaifriendly first message.
- Synced with NG through `users/<uid>/meta/templates` {items, updatedAt}, newest wins, `punter_templates_ts` local stamp.
- Contacts with `tfMsgAt` (Thaifriendly first message pasted from NG) count as messaged in the burst "not messaged" filter.

## p.25
- Burst pacing guard: Settings > Burst pacing sets max per hour (default 20) and minimum gap (default 90s). The Send & next button becomes a countdown when you are ahead of the pace and shows sent-this-hour / cap. Send timestamps in `punter_sent_ts`, settings in `punter_pace`.

## p.24
- Age chip (bold mono, dark pill) after the name on the row and in the detail header, all sites. No age: nothing on the row, detail shows a dashed "Set age" chip.
- Tap the chip in detail to set or change age (18 to 99, blank clears). Saved via `store.update` so it syncs to NG through the existing `age` merge field.
- Age band bar under the city bar: Any, 18-21, 22-25, 26-30, 31-40, 40+, ?. Independent of status filter, persisted as `punter_age`. Counts per band for the current category.

## p.23
- TH country chip teal (`#e0f2f1` / `#0f6e64`), was identical to PT.

## p.22
- Username identity: contacts from thaifriendly arrive with `handle` (tf:<username>) and no number. Row title shows the username with a TF chip, "Add number" chip opens the Number and rates sheet, WA/SMS on a no-number contact open the sheet instead.
- Number and rates sheet (overlay): number box (+66 added on Thai contacts), three slots (ST/LT/ON on thaifriendly, 15min/30min/1hr elsewhere), per-slot extras from preset chips (users/<uid>/meta/extras, shared with Number Grabber) or free type, computed totals. Stored as `slots`; NG pulls it back.
- Number collision rule: a typed number that matches another contact merges this one into it (username kept as alias, slots, profile fields, images carried over), the source doc is flagged `mergedInto` and hidden; NG drops it on the next sync.
- TH routing (+66), Thai flag, city centres Bangkok, Pattaya, Phuket, Chiang Mai, Hua Hin.
- Details show username, site, age, gender, country, city, joined, height, weight, last active, and rates as slot totals with extras breakdown.
- Edit form: number field now also writes e164.
