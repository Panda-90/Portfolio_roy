# Employee Dashboard Upgrades

This plan details how we will tackle the three major tasks: End-to-End Frontend Testing, UI Polishing, and implementing True JWT Authentication.

## User Review Required

> [!WARNING]
> Implementing true authentication will require installing new dependencies (`passlib`, `bcrypt`, `PyJWT`) and changing how your frontend makes API calls. 

## Open Questions

1. **Initial Admin Setup**: For the new true authentication, how would you like the first admin user created? I can write a script to insert an admin into the database directly, or expose a temporary `/register_admin` endpoint. (I recommend the script approach for better security).
2. **UI Aesthetic**: I will implement a modern aesthetic featuring a sleek dark mode sidebar, glassmorphic (semi-transparent blurred) cards, vibrant gradients, and smooth hover animations. Does this sound good?

## Proposed Changes

### Phase 1: True Authentication (Backend)

We will replace the hardcoded "admin" login with a real database-backed authentication system.

#### [MODIFY] `backend/models.py`
- Add a new `Admin` table with `username` and `hashed_password` columns.

#### [MODIFY] `backend/main.py`
- Add `passlib` and `PyJWT` for password hashing and token generation.
- Update the `/login` route to verify credentials against the `Admin` table and return a JWT token.
- Secure the `/employees` routes by requiring a valid JWT token via headers (`Authorization: Bearer <token>`).

### Phase 2: True Authentication (Frontend)

The frontend needs to be updated to capture, store, and transmit the JWT token.

#### [MODIFY] `frontend/js/login.js` & `frontend/js/auth.js`
- Update login logic to capture the JWT from the backend and save it in `localStorage`.
- Update `auth.js` to redirect unauthenticated users securely.

#### [MODIFY] `frontend/js/employee.js`, `frontend/js/dashboard.js`, & `frontend/js/register.js`
- Append the `Authorization: Bearer <token>` header to all `fetch` requests sent to the backend.

### Phase 3: UI Polish

We will inject a premium look and feel into the application.

#### [MODIFY] `frontend/css/style.css`
- Import a modern Google Font (e.g., 'Inter' or 'Outfit').
- Introduce a vibrant and cohesive color palette with subtle gradients.
- Add CSS transitions and micro-animations (e.g., cards lifting on hover, smooth button pulses).
- Implement soft shadows and glassmorphic elements for the dashboard components.

### Phase 4: Frontend Registration Test

To definitively test that the frontend properly registers an employee into PostgreSQL:
- I will spin up a local static server to serve your frontend.
- I will deploy a **Browser Subagent**—an AI that can physically control a browser—to navigate to your registration page, fill out the form, click submit, and verify the success alert. 
- I will then query the PostgreSQL database to confirm the data was securely inserted.

## Verification Plan

### Automated Tests
- Run `pip install passlib bcrypt pyjwt` to ensure dependencies are installed.

### Manual Verification
- We will use the browser subagent to perform an actual end-to-end user flow for registering an employee.
- I will provide you with a Python script you can run to easily create your own admin users.
