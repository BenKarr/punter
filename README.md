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
