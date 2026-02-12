# User Management Application (Next.js)

This project is a Next.js web application for adding, editing, listing, and deleting users.

It is configured to use the following API domain:

- `http://localhost:18100`

Endpoints in use:

- `http://localhost:18100/api/TestAPI/Getusers`
- `http://localhost:18100/api/TestAPI/Postusers`
- `http://localhost:18100/api/TestAPI/Deleteusers`

## Features

- Add user
- Edit user
- Delete user
- List users
- Required fields and max-length validation:
  - User No. (required, max 20)
  - Last Name (required, max 80)
  - First Name (required, max 80)
  - Middle Name (optional, max 80)
  - Birthdate (required)
  - Gender (Male/Female)
  - Civil Status (Single/Married/Separated/Widowed)
  - Skills (Skill 1 to Skill 4)

## Technical notes

- The frontend calls local Next.js API routes:
  - `GET /api/users`
  - `POST /api/users`
  - `POST /api/users/delete`
- These routes proxy requests to `http://localhost:18100`.
- POST requests use `application/x-www-form-urlencoded`.
- Credentials are omitted for upstream POST requests (equivalent to `xhr.withCredentials = false` behavior).

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.
