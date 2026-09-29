# Switch on Export photos (one time, about 15 minutes at a computer)

punter's Export photos runs on a small cloud function in your Firebase project (punter-69ae4). Nothing has ever been deployed there, so these steps do it once. Number Grabber's export needs none of this.

## 1. Blaze plan (card on file)
Open https://console.firebase.google.com/project/punter-69ae4/usage/details, choose Modify plan, then Blaze, and add a card.
Then set a budget alert: Google Cloud console, Billing, Budgets & alerts, Create budget, £5, alerts at 50%, 90% and 100%.

## 2. Turn on Storage
Open https://console.firebase.google.com/project/punter-69ae4/storage, press Get started, keep production mode and pick the location us-central1 (inside Google's free allowance and next to the function).

## 3. On your computer
Install Node.js 22 LTS from https://nodejs.org (the LTS button). Unzip ng_39-p_37.zip, open Terminal (Mac) or Command Prompt (Windows) and run one line at a time:

    npm install -g firebase-tools
    firebase login
    cd <the unzipped folder>/punter-p.37/functions
    npm install
    cd ..
    firebase deploy --only functions

- `firebase login` opens a browser: sign in with the Google account you use for punter.
- The first deploy asks to switch on a few Google APIs: answer Y. It takes 3 to 5 minutes.
- If it asks how many days to keep container images, press Enter for the default.
- If the first deploy stops with a permissions or "service agent" error, wait two minutes and run the last line again. That happens on a project's first deploy.

## 4. Check
https://console.firebase.google.com/project/punter-69ae4/functions should list copyContactImages and exportPhoto.
On the phone, open a contact and tap Export photos. If the sheet says the cloud function isn't deployed, step 3 didn't finish.

## What it costs
Each exported photo is kept in Storage (about 0.3 MB), so a few hundred contacts is a few hundred MB: inside the free allowance or pennies a month. The function itself stays inside its free allowance at your volume.
