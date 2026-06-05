# Caching Strategy & Async Queues Guide

This document explains the caching layer strategy, Redis security configurations, and the asynchronous task queuing mechanism implemented in the Mandal backend to assure responsiveness, high-throughput, and environment isolation.

---

## 1. Caching Strategy (Cache-Aside Pattern)

The application implements a **Cache-Aside (Lazy Loading)** caching pattern at the repository layer, utilizing Redis to intercept frequent database read actions.

```
                  +-----------------------+
                  |    Client Request     |
                  +-----------+-----------+
                              |
                     [ Check Redis Cache ]
                              |
             +----------------+----------------+
             |                                 |
        (Cache Hit)                       (Cache Miss)
             |                                 |
     [ Return cached JSON ]            [ Query MySQL DB ]
                                               |
                                     [ Save result in Cache ]
                                               |
                                     [ Return SQL Result ]
```

### Key Management & Keyspaces:
Cache keys are strictly namespaced to prevent collisions:
- **User Record Keys**:
  - By ID: `cache:user:id:${userId}`
  - By Mobile: `cache:user:mobile:${mobile}`
  - By Email: `cache:user:email:${email}`
- **User Roles Keys**: `cache:user:roles:${userId}`
- **Mandal Record Keys**:
  - By ID: `cache:mandal:id:${mandalId}`
  - By Name: `cache:mandal:name:${name}`
- **Mandal Member Keys**:
  - By Role: `cache:mandal_member:role:${userId}:${mandalId}`
  - By Relation: `cache:mandal_member:relation:${userId}:${mandalId}`

### Cache Expiry & TTL:
- All cache writes use a default Time-To-Live (TTL) of **3600 seconds (1 hour)**. This guarantees that memory is freed periodically and prevents long-term storage of stale data.

### Cache Invalidation on Writes:
To guarantee absolute data consistency, any mutative actions (`create`, `update`, `delete`) in the repositories automatically invalidate their associated cache keys:
- **User Update**: Instantly deletes the cached user record from all lookup structures (ID, Mobile, and Email keys).
- **Mandal Update/Delete**: Automatically drops keys by ID and Name.
- **Mandal Member (Add/Remove)**: Triggers immediate invalidation of the member's cached role and relationship record.

---

## 2. Redis Security

The Redis cache is hardened with several production-grade security boundaries:

- **Authenticated Connections**:
  - Connection options in both [redis.config.js](file:///c:/Users/GrowShadow/Documents/Mandal-Final/src/infrastructure/cache/redis.config.js) and [bull.config.js](file:///c:/Users/GrowShadow/Documents/Mandal-Final/src/infrastructure/queue/bull.config.js) strictly enforce the password parameter `process.env.REDIS_PASSWORD` if defined.
- **Database Segmentation**:
  - The application uses `REDIS_DB=2` to isolate its keyspace. This isolates the Mandal data from other databases running on the same Redis cluster.
- **Fail-Safe Mechanism**:
  - Caching is non-blocking. If the Redis client goes offline, the `isCacheReady()` checker in `cache.service.js` automatically returns `false`, causing all repositories to bypass the caching layer and safely read directly from MySQL. The app remains fully operational.
- **Test Mode Exclusion**:
  - Caching is disabled when `NODE_ENV === 'test'` to guarantee unit and integration tests run in absolute isolation with zero caching state carryover.

---

## 3. Asynchronous Queues (BullMQ)

To keep API request-response loops fast, resource-heavy operations (e.g. sending SMS OTP notifications) are offloaded to an asynchronous task queue.

- **Technology**: **BullMQ**, running on top of the Redis connection.
- **Queue Instance**: The `notificationQueue` (configured in [bull.config.js](file:///c:/Users/GrowShadow/Documents/Mandal-Final/src/infrastructure/queue/bull.config.js)) manages background jobs.
- **Workflow**:
  1. Hitting auth endpoints (like registering or requesting OTP) publishes a job containing the recipient number and payload to the `notifications` queue.
  2. The HTTP request returns immediately to the user, providing a fast response time.
  3. A background BullMQ Worker picks up the job and dispatches the SMS via the Twilio integration.
- **Security**: The queue connects using the identical parameterized Redis configurations (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`), ensuring credentials are never exposed in queue descriptors.
