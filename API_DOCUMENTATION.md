# Proactive Planner API Documentation

This document outlines the API endpoints required for the Proactive Planner application. All endpoints are prefixed with `/api`.

**Authentication:** All endpoints, except for Auth, require a `Authorization: Bearer <token>` header with a valid JWT.

---

## 1. Authentication

### `POST /auth/signup`
- **Description:** Creates a new user account.
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
- **Description:** Authenticates a user and returns a JWT.
- **Request Body:** `{ "email": "user@example.com", "password": "password123" }`
- **Success Response (200):** Returns the user object and a JWT.
  ```json
  {
    "user": { "id": "uuid", "email": "user@example.com" },
    "token": "jwt.token.string"
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Invalid credentials.

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
    "theme": "dark"
  }
  ```

---

## 3. Planned Tasks (`/tasks`)

### `POST /tasks`
- **Description:** Adds a new task to the user's plan for today.
- **Request Body:** `{ "text": "My new task", "goalId": "uuid" | null, "priority": "high", "tags": ["work"] }`
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

## 4. Goals (`/goals`)

### `GET /goals`
- **Description:** Fetches all goals for the user.
- **Success Response (200):** An array of goal objects.

### `POST /goals`
- **Description:** Creates a new goal.
- **Request Body:** `{ "text": "Launch my project", "category": "Long Term", "deadline": "ISO_date_string" | null }`
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

## 5. Daily Routine (`/routine`)

### `POST /routine`
- **Description:** Adds a new task to the daily routine.
- **Request Body:** `{ "text": "Meditate", "goalId": "uuid" | null, "recurringDays": [1, 2, 3, 4, 5] }`
- **Success Response (201):** The newly created routine task object.

*(Similar PUT, DELETE, and reorder endpoints as for Planned Tasks would also exist for Routine Tasks)*

---

## 6. Reflections (`/reflections`)

### `POST /reflections`
- **Description:** Adds or updates a reflection for a specific day. The backend should handle upsert logic.
- **Request Body:** `{ "date": "yyyy-MM-dd", "well": "...", "improve": "..." }`
- **Success Response (201):** The created/updated reflection object.
