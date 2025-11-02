# Proactive Planner API Documentation

This document outlines the API endpoints required for the Proactive Planner application. All endpoints are prefixed with `/api/v1`.

**Authentication:** All endpoints, except for Auth, require a `Authorization: Bearer <token>` header with a valid JWT.

---

## 1. Authentication

### `POST /auth/signup`
- **Description:** Creates a new user account with email and password. **Server must enforce a strong password policy (e.g., using a library like `zxcvbn`).**
- **Request Body:** `{ "email": "user@example.com", "password": "password123" }`
- **Success Response (201):** Returns the new user object and a JWT.
  ```json
  {
    "user": { "id": "uuid", "email": "user@example.com" },
    "token": "jwt.token.string"
  }
  ```
- **Error Responses:**
  - `409 Conflict`: If the email already exists.

### `POST /auth/login`
- **Description:** Authenticates a user and returns a JWT. Can be a multi-step process for 2FA.
- **Request Body:** `{ "email": "user@example.com", "password": "password123", "twoFactorCode": "123456" | null }`
- **Success Response (200):** 
  - If 2FA is not required or code is valid, returns the user object and a JWT.
    ```json
    {
      "user": { "id": "uuid", "email": "user@example.com", "isTwoFactorEnabled": true },
      "token": "jwt.token.string"
    }
    ```
  - If 2FA is required and no code is provided, returns a challenge.
    ```json
    {
      "twoFactorRequired": true
    }
    ```
- **Error Responses:**
  - `401 Unauthorized`: Invalid credentials or invalid 2FA code.

### `GET /auth/google`
- **Description:** Initiates the Google OAuth 2.0 login flow. Redirects the user to Google's consent screen.
- **Response:** `302 Redirect` to Google's authentication URL.

### `GET /auth/google/callback`
- **Description:** The callback URL Google redirects to after user consent. The server exchanges the received code for a user profile, creates or finds the user in the database, and then redirects the client with a JWT.
- **Response:** `302 Redirect` to the frontend app, e.g., `https://yourapp.com/auth/callback?token=jwt.token.string`.

*(Similar endpoints would exist for `/auth/github` and `/auth/github/callback`)*

### `POST /auth/forgot-password`
- **Description:** Initiates the password reset process. The server generates a unique, single-use token, stores its hash and expiry in the database, and sends an email to the user with a reset link.
- **Request Body:** `{ "email": "user@example.com" }`
- **Success Response (200):** Returns a success message. For security reasons, the response is the same whether the user exists or not.
  ```json
  { "message": "If an account with this email exists, a password reset link has been sent." }
  ```

### `POST /auth/reset-password`
- **Description:** Sets a new password for a user using a valid reset token. **Server must enforce a strong password policy.**
- **Request Body:** `{ "token": "the-reset-token-from-email", "password": "newStrongPassword123" }`
- **Success Response (200):** Returns a success message.
  ```json
  { "message": "Password has been reset successfully." }
  ```
  
### `POST /auth/2fa/setup`
- **Description:** Generates a new 2FA secret and a QR code data URL for the authenticated user to scan.
- **Success Response (200):**
  ```json
  {
    "secret": "BASE32_ENCODED_SECRET",
    "qrCode": "data:image/png;base64,..."
  }
  ```

### `POST /auth/2fa/verify`
- **Description:** Verifies a 2FA code provided by the user and enables 2FA for their account if the code is valid.
- **Request Body:** `{ "code": "123456" }`
- **Success Response (200):** `{ "message": "2FA has been enabled." }`
- **Error Responses:**
  - `401 Unauthorized`: Invalid code.

### `POST /auth/2fa/disable`
- **Description:** Disables 2FA for the authenticated user.
- **Success Response (200):** `{ "message": "2FA has been disabled." }`

---

## 2. Bootstrap

### `GET /bootstrap`
- **Description:** Fetches all the initial data required to populate the application state for the logged-in user. This is called once after login or on app load if a valid token exists.
- **Success Response (200):** Returns a single JSON object containing all of the user's data.
  ```json
  {
    "plan": { "date": "yyyy-MM-dd", "tasks": [...] },
    "logs": [...],
    "goals": [...],
    "routine": [...],
    "unplannedTasks": [...],
    "reflections": [...],
    "performanceHistory": [...],
    "streak": { "current": 5, "longest": 10, "lastActivityDate": "yyyy-MM-dd" },
    "unlockedAchievements": ["FIRST_TASK", ...],
    "theme": "dark",
    "dashboardLayout": { "left": ["score", "routine", "plan"], "right": ["goals", "unplanned", "insights"] }
  }
  ```

---

## 3. User (`/users`)

### `PUT /users/me/layout`
- **Description:** Saves the user's preferred dashboard layout.
- **Request Body:** `{ "left": ["score", "routine"], "right": ["goals"] }`
- **Success Response (200):** The updated user object or a confirmation message.

---


## 4. Planned Tasks (`/tasks`)

### `POST /tasks`
- **Description:** Adds a new task to the user's plan for today.
- **Request Body:** `{ "text": "My new task", "goalId": "uuid" | null, "priority": "high", "tags": ["work"] }`
- **Idempotency:** Supports `Idempotency-Key` header.
- **Success Response (201):** The newly created task object.

### `PUT /tasks/:id`
- **Description:** Updates an existing task (e.g., priority, tags, dependencies).
- **Request Body:** `{ "priority": "low", "dependsOn": ["uuid-of-other-task"] }`
- **Success Response (200):** The updated task object.

### `PUT /tasks/:id/toggle`
- **Description:** Toggles the completion status of a task.
- **Success Response (200):** The updated task object.

### `DELETE /tasks/:id`
- **Description:** Deletes a task.
- **Success Response (204):** No content.

### `POST /tasks/reorder`
- **Description:** Updates the order of all tasks for the day.
- **Request Body:** `[{ "id": "uuid", "order": 0 }, { "id": "uuid", "order": 1 }]`
- **Success Response (200):** A confirmation message.

---

## 5. Goals (`/goals`)

### `GET /goals`
- **Description:** Fetches all goals for the user. Supports pagination.
- **Query Parameters:** `cursor={lastCursorId}`
- **Success Response (200):** An array of goal objects and a `nextCursor`.

### `POST /goals`
- **Description:** Creates a new goal.
- **Request Body:** `{ "text": "Launch my project", "category": "Long Term", "deadline": "ISO_date_string" | null }`
- **Idempotency:** Supports `Idempotency-Key` header.
- **Success Response (201):** The newly created goal object.

### `PUT /goals/:id/toggle`
- **Description:** Toggles the completion status of a goal.
- **Success Response (200):** The updated goal object.

### `PUT /goals/:id/archive`
- **Description:** Archives a goal.
- **Success Response (200):** The updated goal object.

### `PUT /goals/:id/restore`
- **Description:** Restores an archived goal.
- **Success Response (200):** The updated goal object.

### `DELETE /goals/:id`
- **Description:** Permanently deletes a goal.
- **Success Response (204):** No content.

---

## 6. Daily Routine (`/routine`)

### `POST /routine`
- **Description:** Adds a new task to the daily routine.
- **Request Body:** `{ "text": "Meditate", "goalId": "uuid" | null, "recurringDays": [1, 2, 3, 4, 5] }`
- **Idempotency:** Supports `Idempotency-Key` header.
- **Success Response (201):** The newly created routine task object.

*(Similar PUT, DELETE, and reorder endpoints as for Planned Tasks would also exist for Routine Tasks)*

---

## 7. Reflections (`/reflections`)

### `GET /reflections`
- **Description:** Fetches past reflections. Supports pagination and full-text search.
- **Query Parameters:** 
  - `cursor={lastCursorDate}`
  - `search={searchTerm}`
- **Success Response (200):** An array of reflection objects and a `nextCursor`.

### `POST /reflections`
- **Description:** Adds or updates a reflection for a specific day. The backend should handle upsert logic.
- **Request Body:** `{ "date": "yyyy-MM-dd", "well": "...", "improve": "..." }`
- **Idempotency:** Supports `Idempotency-Key` header.
- **Success Response (201):** The created/updated reflection object.

---

## 8. Analytics (`/analytics`)

### `GET /analytics/time-summary`
- **Description:** Fetches aggregated time tracking data for the user.
- **Success Response (200):** An object containing time summaries.
  ```json
  {
    "byGoal": [ { "goalId": "uuid", "goalText": "...", "duration": 3600 }, ... ],
    "byTag": [ { "tag": "work", "duration": 7200 }, ... ]
  }
  ```

---

## 9. Data Exports (`/exports`)

Handles asynchronous data export jobs.

### `POST /exports`
- **Description:** Initiates a new data export job. The server will process this in the background.
- **Request Body:** `{ "format": "json" | "markdown" | "csv-tasks" | "csv-goals" }`
- **Idempotency:** Supports `Idempotency-Key` header.
- **Success Response (202 Accepted):** Returns the newly created job object.

### `GET /exports`
- **Description:** Fetches a list of all recent export jobs for the user. Supports pagination.
- **Query Parameters:** `cursor={lastCursorId}`
- **Success Response (200):** An array of job objects and a `nextCursor`.

### `GET /exports/:id/download`
- **Description:** Downloads the file for a completed export job.
- **Success Response (200):** The file content.

---

## 10. Notifications (`/notifications`)

### `POST /notifications/subscribe`
- **Description:** Saves a user's PushSubscription object to the database.
- **Request Body:** The `PushSubscription` object from the browser.
- **Success Response (201):** Confirmation message.

### `POST /notifications/unsubscribe`
- **Description:** Deletes a user's PushSubscription object.
- **Request Body:** `{ "endpoint": "..." }`
- **Success Response (200):** Confirmation message.

---

## 11. WebSockets API

- **Connection:** Client establishes a WebSocket connection after successful login.
- **Purpose:** To push real-time updates from the server to the client, reducing the need for polling.

### Server-to-Client Events

- **`export:updated`**
  - **Payload:** The updated `ExportJob` object.
  - **Description:** Sent when an export job's status changes (e.g., from `processing` to `complete`).
- **`achievement:unlocked`**
  - **Payload:** The `Achievement` object that was just unlocked.
  - **Description:** Sent when the user's actions result in a new achievement.
- **`plan:updated`**
  - **Payload:** `{ "date": "YYYY-MM-DD", "updatedTasks": [...] }`
  - **Description:** Used for real-time collaboration. Sent when another user modifies a shared plan.