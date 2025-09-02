# Architecture

The Mandal backend follows a clean architecture with:
- **API**: RESTful endpoints under `v1` and `v2`.
- **Domains**: Business logic for auth, mandal, and finance.
- **Infrastructure**: Database, cache, and external services.
- **Events**: Event-driven notifications using BullMQ.
- **Utils**: Shared utilities like logging and cron jobs.