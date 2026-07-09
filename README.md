# SCALE

## Authentication setup

The Lesson Plans and Articles sections are protected by a simple sheet-backed login flow that runs through a Google Apps Script web app bound to the credential spreadsheet.

Required environment variables:

- `AUTH_APPS_SCRIPT_URL`
- `SESSION_SECRET`
- `ARTICLES_CSV_URL`

Apps Script web app expectations:

- Bind the script to the credential spreadsheet or set `AUTH_SHEET_ID` as a script property if you deploy it standalone.
- Deploy the script as a web app and copy the `/exec` URL into `AUTH_APPS_SCRIPT_URL`.
- The script reads the `Authorized Users` tab and writes access requests into the `Access Requests` tab.
- `ARTICLES_CSV_URL` should point to the published CSV export for the Articles Cataloged sheet.

Expected Google Sheet tabs:

- `Authorized Users`
  - `Email`
  - `Name`
  - `Password`
  - `Organization`
  - `Active`
  - `Created On`
- `Access Requests`
  - `Timestamp`
  - `First Name`
  - `Last Name`
  - `Email`
  - `Organization`
  - `Reason`
  - `Status`

Deployment notes for AWS Amplify:

- Build command: `npm run build`
- The app now uses middleware and route handlers for auth, so it should be deployed as a Next.js server app rather than static export.
- The Apps Script web app handles the credential spreadsheet directly, so no Google Cloud service account key is needed in the Next.js app.
