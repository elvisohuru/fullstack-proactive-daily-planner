# Proactive Planner Background Jobs

This document outlines the asynchronous processes that run on the backend, independent of direct user API requests. These are managed by a queueing system (e.g., BullMQ with Redis) and cron schedulers.

---

## 1. Cron Jobs (Scheduled Tasks)

### Daily User Rollover & Streak Calculation
- **Schedule:** Runs once every day at midnight in the user's timezone.
- **Trigger:** A cron job scheduler.
- **Logic:**
  1.  Iterate through all users whose timezone just passed midnight.
  2.  **Calculate Productivity Score:**
      -   Get the user's `TodaysPlan` and `DailyRoutine` for the day that just ended.
      -   Calculate the final productivity score (`completed_tasks / total_tasks * 100`).
      -   Save this score to the `PerformanceHistory` table for that day.
  3.  **Update Streak:**
      -   Check the user's `Streak` record.
      -   If the calculated score is >= 75% (or another defined threshold), increment their `current` streak and update the `lastActivityDate`. If `current` > `longest`, update `longest`.
      -   If the score is < 75%, reset `current` streak to 0.
  4.  **Reset Daily State:**
      -   Reset the `completed` status of all `RoutineTask`s for the user to `false` for the new day.
      -   (Optional) The system could automatically move unfinished `Task`s from the previous day to the new day's plan or an "Unplanned" inbox.

### Password Reset Token Cleanup
- **Schedule:** Runs periodically (e.g., every hour).
- **Trigger:** A cron job scheduler.
- **Logic:**
  1.  Query the `User` table for all records where `passwordResetExpires` is not null.
  2.  Find all records where `passwordResetExpires` is in the past.
  3.  For each expired record, set `passwordResetToken` and `passwordResetExpires` to `NULL`.
  4.  This ensures the database does not accumulate unused, expired tokens, maintaining data hygiene and security.


---

## 2. Background Workers (Queue-Based Jobs)

### Data Export Generator
- **Trigger:** A user makes a `POST /api/exports` request.
- **Queue:** `exports`
- **Job Payload:** `{ "userId": "uuid", "format": "json" | "csv" | "markdown" }`
- **Worker Logic:**
  1.  Pick up a new job from the `exports` queue.
  2.  Update the job status in the database from `pending` to `processing`.
  3.  Fetch all necessary data for the user from the database (tasks, goals, logs, etc.).
  4.  Based on the `format` in the job payload, serialize the data into the correct file format.
  5.  Upload the resulting file to a secure, private storage location (e.g., a private S3 bucket).
  6.  Generate a secure, short-lived signed URL for the uploaded file.
  7.  Update the job status in the database to `complete` and store the signed `downloadUrl`.
  8.  (Optional) Send a notification to the user (e.g., via websocket or email) that their export is ready.
- **Error Handling:** If any step fails, the worker updates the job status to `failed` and logs the error.

### Notification Sender
- **Trigger:** Various application events (e.g., a cron job for a task reminder, a background job completing).
- **Queue:** `notifications`
- **Job Payload:** `{ "userId": "uuid", "payload": { "title": "Reminder!", "body": "Your task is due in 10 minutes." } }`
- **Worker Logic:**
  1. Pick up a new job from the `notifications` queue.
  2. Fetch all active `PushSubscription` objects from the database associated with the `userId`.
  3. For each subscription, use a web-push library to send the `payload` to the push service endpoint.
  4. Handle API responses from the push service, such as `410 Gone` to indicate an expired subscription, and remove those from the database.
