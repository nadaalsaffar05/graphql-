# GraphQL Profile

A small profile dashboard made with HTML, CSS, JavaScript, and GraphQL.

After signing in with a Reboot account, the page shows the student's profile information, XP, completed projects, audit ratio, level, charts, and recent project grades.

## Features

- Login with username/email and password
- GraphQL requests with the saved authentication token
- Total XP with an XP progress chart
- Project pass/fail/pending chart
- Completed-project count, audit ratio, and current level
- Recent project grades table
- Responsive layout for desktop and mobile
- Logout button

## How to run it

1. Clone or download this repository.
2. Open the folder in VS Code.
3. Run `index.html` using Live Server (or another local web server).
4. Sign in with your Reboot account.

Do not put your password or token in the code. The token is saved in the browser's local storage after a successful login.

## Project structure

- `index.html`: login page
- `profile.html`: dashboard page
- `css/`
  - `login.css`: login-page styles
  - `profile.css`: dashboard styles
- `js/`
  - `auth.js`: sign-in logic
  - `graphql.js`: GraphQL request helper
  - `profile.js`: loads profile data
  - `charts.js`: SVG charts
- `assets/images/`: page images

## API

The project uses these Reboot endpoints:

- `https://learn.reboot01.com/api/auth/signin`
- `https://learn.reboot01.com/api/graphql-engine/v1/graphql`

## XP note

The XP total in this dashboard may be different from the total shown on Intra. Intra excludes many checkpoint exercises and the full Go piscine, while this project includes those XP transactions in its calculation.
