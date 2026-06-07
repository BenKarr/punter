# punter capture Shortcut, one-time setup

You can't install a Shortcut from a file here, but building it takes about five
minutes and then it lives in your Share Sheet forever.

## Build it
1. Open the **Shortcuts** app, tap **+** to create a new Shortcut.
2. Name it **Send to punter**.
3. Add action **Run JavaScript on Web Page**.
   - This action only appears for Shortcuts that accept Safari web pages, which
     is handled by the share-sheet setting in step 6.
4. Replace the placeholder JS with the entire contents of `punter-capture.js`.
5. Add action **Open URLs**, and set its input to the **result** of the
   JavaScript action (it will be offered as a magic variable).
6. Tap the Shortcut's settings (the (i) or the name at the top) and turn on
   **Show in Share Sheet**. Under accepted types, leave **Safari web pages** /
   **URLs** enabled.

## Use it
1. On a listing, tap **See Phone Number** so the Call / WhatsApp link is live.
2. Tap **Share** in Safari, then **Send to punter**.
3. punter opens with the contact prefilled. Glance, save.

## Notes
- Opening the PWA from a Shortcut may land in Safari rather than the installed
  app. That's fine: the capture writes to Firebase and the installed punter
  picks it up on sync within a second or two.
- If the number doesn't come through on a given site, the contact still saves
  with everything else and you paste the number on the contact. The grab reads
  the revealed `tel:` / `wa.me` link, so reveal first.
- The script handles Vivastreet and Publi24 today. Other sites fall back to
  page title and the share URL only. New sites = a new `else if` block.
