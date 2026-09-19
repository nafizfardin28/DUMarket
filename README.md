# DUMarket — Authentication Phase

A campus marketplace for DU students. This phase implements sign-up (DU
email verification + registration number + buyer/seller role selection),
login, and JWT-based sessions. Listings, chat, and ratings are not built
yet.

## Stack

- **Backend**: NestJS (Express) + Prisma
- **Database**: PostgreSQL
- **Frontend**: React (Vite) + `react-router-dom` + `axios` + Tailwind CSS

## How it maps to the product story

- **Sign up with @du.ac.bd (or a department subdomain like @it.du.ac.bd)** →
  [`common/validators/du-email.validator.ts`](backend/src/common/validators/du-email.validator.ts)
  rejects any other domain, both client-side and server-side.
- **"This one step already makes buyers trust him more"** → accounts start
  `isEmailVerified=false` and can't log in until they click the emailed
  link ([`auth/auth.service.ts`](backend/src/auth/auth.service.ts),
  [`mail/mail.service.ts`](backend/src/mail/mail.service.ts)).
- **"select who they are: sellers or buyers"** → `role` is a required field
  on sign-up (`buyer` or `seller`), picked via the toggle in
  [`SignupPage.jsx`](frontend/src/pages/SignupPage.jsx).
- **Registration number** → required, numeric, unique per account
  ([`common/validators/reg-no.validator.ts`](backend/src/common/validators/reg-no.validator.ts)).
- **Hall** → required field on the user (picked from a dropdown of every DU
  hall), ready to reuse for pickup-point suggestions once listings exist.

## Backend setup

```bash
cd backend
npm install

cp .env.example .env   # fill in DATABASE_URL, JWT secrets, SMTP creds, etc.

# Create the Postgres role + database (adjust to your local Postgres setup)
sudo -u postgres psql -c "CREATE USER dumarket_user WITH PASSWORD 'devpassword';"
sudo -u postgres psql -c "CREATE DATABASE dumarket OWNER dumarket_user;"

npx prisma db push      # creates the schema (use `prisma migrate dev` instead
                         # if your DB user has CREATEDB privilege, for proper
                         # migration history)
npm run start:dev
```

By default `EMAIL_HOST_USER`/`EMAIL_HOST_PASSWORD` are blank, so
verification emails just print to the terminal running the server instead
of actually sending — copy the `.../verify-email/<uid>/<token>` link from
there while developing. Fill in real Gmail SMTP + an app password in `.env`
for real delivery.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:8000/api
npm run dev
```

Visit `http://localhost:5173`.

## API endpoints

| Method | Endpoint                          | Auth | Purpose |
|--------|------------------------------------|------|---------|
| POST   | `/api/auth/register/`              | none | Create account (email, full_name, regNo, role, hall, phone, password, password2) |
| POST   | `/api/auth/verify-email/`          | none | Body: `{uid, token}` from the emailed link |
| POST   | `/api/auth/resend-verification/`   | none | Body: `{email}` |
| POST   | `/api/auth/login/`                 | none | Body: `{email, password}` → `{access, refresh, user}` |
| POST   | `/api/auth/token/refresh/`         | none | Body: `{refresh}` → `{access, refresh}` |
| GET    | `/api/auth/me/`                    | JWT  | Current user's profile |

Error responses match the shape the frontend expects: `{ field: ["message", ...] }`
per invalid field, or `{ detail: ["message"] }` for non-field errors (wrong
credentials, unverified account, invalid/expired token, etc).

## What's next

Listings (with category/hall filters), in-app chat, meetup-point
suggestion, and seller ratings are the next phases per the product story —
none of that is wired up yet.
