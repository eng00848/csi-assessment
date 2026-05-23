# CSI Assessment — Deployment Guide

## What you'll end up with
- A live URL (e.g. `https://csi-assessment.vercel.app`) you can share with any candidate
- Every submission automatically saved to a Google Sheet (name, email, scores, style, all 20 responses)
- Candidates download their own 10-page PDF report instantly

---

## STEP 1 — Set up Google Sheets (5 minutes)

### 1a. Create the spreadsheet
1. Go to https://sheets.google.com
2. Create a new blank spreadsheet
3. Name it **CSI Assessment Results**

### 1b. Open Apps Script
1. In the spreadsheet, click **Extensions → Apps Script**
2. Delete all the default code in the editor
3. Open the file `google-apps-script.js` from this project folder
4. Copy the entire contents and paste it into the Apps Script editor
5. Click **Save** (floppy disk icon or Ctrl+S)

### 1c. Deploy as a Web App
1. Click **Deploy → New Deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Fill in:
   - Description: `CSI Assessment v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** → choose your Google account → Allow
6. **COPY THE WEB APP URL** — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`
   Keep this URL — you'll need it in Step 3.

---

## STEP 2 — Deploy to Vercel (5 minutes)

### Option A — Via GitHub (recommended)
1. Create a free account at https://github.com
2. Create a new repository called `csi-assessment`
3. Upload all the files from this folder to the repository
4. Go to https://vercel.com and sign in with GitHub
5. Click **Add New Project** → select your `csi-assessment` repository
6. Vercel auto-detects Vite — leave all settings as default
7. Click **Deploy** — wait ~1 minute

### Option B — Via Vercel CLI (if you have Node.js installed)
```bash
cd csi-assessment
npm install
npx vercel
```
Follow the prompts. Your URL will be shown at the end.

---

## STEP 3 — Connect Google Sheets to Vercel (2 minutes)

1. In your Vercel project dashboard, go to **Settings → Environment Variables**
2. Add a new variable:
   - Name: `VITE_SHEETS_URL`
   - Value: *(paste the Web App URL from Step 1c)*
3. Click **Save**
4. Go to **Deployments** → click the three dots on your latest deployment → **Redeploy**

Done! Your app is now live and connected.

---

## STEP 4 — Test it

1. Open your Vercel URL
2. Fill in a test name/email and complete the assessment
3. Check your Google Sheet — a new row should appear within a few seconds
4. Download the report and open it in your browser → File → Print → Save as PDF

---

## Sharing with candidates

Just send them your Vercel URL, e.g.:
`https://csi-assessment.vercel.app`

Each candidate:
1. Fills in their name, email, and all 20 responses
2. Clicks "Calculate my style"
3. Sees their result immediately
4. Downloads their personal 10-page PDF report

You see their full record in your Google Sheet automatically.

---

## Viewing your Google Sheet data

Your sheet will have these columns:
- Submitted At, Name, Email, Date
- Conserver Score, Originator Score, Difference
- Style (Conserver / Pragmatist / Originator)
- Sub-Type (e.g. Moderate Originator)
- Q1A through Q20B (all 40 individual scores)

You can sort by Style, filter by date, or add your own columns for notes.

---

## Updating the app

Make changes to the code → push to GitHub → Vercel auto-deploys within ~1 minute.

---

## Troubleshooting

**Sheet not updating?**
- Make sure you redeployed on Vercel after adding the environment variable
- Check that the Apps Script is deployed with "Anyone" access
- In Apps Script, run the `testSetup()` function to verify the connection

**Vercel build failing?**
- Make sure all files are uploaded including `package.json` and `vite.config.js`
- Check the Vercel build log for specific errors

**Candidates seeing a blank page?**
- Clear browser cache or try incognito mode
- Check the browser console for errors
