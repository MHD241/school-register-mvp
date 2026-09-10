# School Register MVP

Fast prototype for a cleaner Scottish school registration workflow.

## Demo rules

- Fake pupil names only.
- No real school data.
- No real medical, attendance, address, parent, or safeguarding data.
- The public demo saves a submitted register locally in the browser.

## GitHub Pages

This repo includes a GitHub Actions workflow that builds the Vite app and deploys `dist/` to GitHub Pages.

After uploading the files:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions**.
3. Open the **Actions** tab and wait for **Deploy to GitHub Pages** to finish.
4. Your demo should appear at:
   `https://mhd241.github.io/school-register-mvp/`

## Backend

A dedicated Supabase project has already been created. The frontend contains only the project's publishable browser key. Never commit a Supabase service-role or secret key.

Next milestone: teacher authentication, demo-school data, real class loading, and secured end-to-end attendance writes.
