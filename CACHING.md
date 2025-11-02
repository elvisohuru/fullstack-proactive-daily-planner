# Proactive Planner Backend Caching Strategy

This document outlines the strategy for using a caching layer in the backend to improve performance, reduce database load, and lower API latency.

## 1. Caching Technology

- **Primary Cache:** **Redis** (managed via AWS ElastiCache).
- **Why Redis?** It's an extremely fast, in-memory key-value store that is simple to use and well-supported in the Node.js ecosystem. It's ideal for the types of caching we need.

---

## 2. Caching Pattern: Cache-Aside

We will primarily use the **Cache-Aside** (or Lazy Loading) pattern. This is a robust and widely-used caching strategy.

**How it works:**
1.  When the application needs to read data (e.g., a user's profile), it first checks the **Redis cache**.
2.  **Cache Hit:** If the data is found in the cache, it's returned directly to the application. This is the fast path.
3.  **Cache Miss:** If the data is **not** in the cache, the application queries the **PostgreSQL database** to get the data.
4.  The application then **populates the Redis cache** with the data it just retrieved from the database.
5.  Finally, the data is returned to the application.

**Advantages:**
- **Resilience:** The application still works if the cache fails; it just becomes slower.
- **Relevant Data:** Only data that is actually requested gets cached.

---

## 3. What to Cache

We will be strategic about what we cache to maximize benefit. Good candidates for caching are:
- **Frequently read, infrequently updated data.**
- **The results of expensive database queries.**

**Specific Examples:**
- **User Sessions:** Storing session data in Redis is much faster than querying the database on every request.
- **User Profiles:** A user's basic profile information (`id`, `email`, `theme`) is a perfect candidate.
- **Achievements List:** The global list of achievement definitions can be cached application-wide.
- **Aggregated Analytics:** Results of complex analytics queries can be cached for a short period (e.g., 5 minutes) to serve multiple users without re-calculating.

---

## 4. Cache Invalidation

Keeping the cache in sync with the database is crucial.

**Strategy:**
- **Write-Through (with TTL):** When data is updated (e.g., a user changes their theme), we will update the PostgreSQL database **and** immediately update or delete the corresponding key in the Redis cache.
- **Time-To-Live (TTL):** All cache keys will be set with a TTL (e.g., 1 hour for user profiles). This ensures that even if our invalidation logic fails, stale data will eventually be evicted from the cache automatically. This is a critical fallback for data consistency.