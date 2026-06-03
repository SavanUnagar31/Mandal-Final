# Input Validation & Data Security Guide

This document outlines the validation mechanisms and data security protocols implemented in the Mandal backend to protect against common web vulnerabilities, including SQL injection, Cross-Site Scripting (XSS), and exposure of sensitive credentials.

---

## 1. Input Validation

The application utilizes **Joi**, a schema validation library, integrated directly as an Express middleware (`validation.middleware.js`). Every request payload (body, parameters, queries) is validated before it hits the route controller.

### Validation Strategies:
- **Type Enforcements**: Restricts fields to exact data types (e.g. `Joi.string()`, `Joi.number()`).
- **Regular Expression Formats**: Mobile numbers are constrained to exactly 10 digits (`/^[0-9]{10}$/`), and OTP codes are constrained to exactly 6 digits (`/^[0-9]+$/`).
- **UUID Schema Checks**: Identifiers like `otpRef` and session IDs are validated as official standard UUIDs (`Joi.string().uuid()`).
- **Bound Constraints**: Coordinates (latitude and longitude) are constrained to geographical boundary ranges:
  - Latitude: `-90` to `90`
  - Longitude: `-180` to `180`
- **Fail-Fast Behavior**: Invalid schemas reject requests immediately at the middleware layer, preventing invalid data from reaching database queries or domain services.

---

## 2. SQL Injection Prevention

SQL Injection (SQLi) is one of the most critical database vulnerabilities. The application guards against it by using **Sequelize ORM** combined with **mysql2**:

### Protection Mechanisms:
- **Parameterized Queries**: Sequelize automatically compiles JavaScript queries into prepared SQL statements. User input values are passed separately as parameters rather than concatenated directly into SQL query strings.
- **Example Flow**:
  - Code: `User.findOne({ where: { mobile } })`
  - Compiled SQL: `SELECT * FROM Users WHERE mobile = ?;` (User input is bound to `?` safely).
- **Strict DataType Enforcement**: Databases refuse parameters that do not match the column's defined type (e.g., trying to execute custom SQL script strings on integer columns), neutralizing raw injection payloads.

---

## 3. Cross-Site Scripting (XSS) Prevention

Cross-Site Scripting (XSS) occurs when malicious client-side script code is injected into database contents and rendered unsafely on other users' screens.

### Protection Mechanisms:
- **Helmet Security Headers**: The application integrates **Helmet** middleware globally to set secure HTTP headers (e.g. `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`) to block unauthorized cross-site scripts and prevent clickjacking.
- **Recursive Input Sanitization**: A custom `sanitizeMiddleware` intercepts request payloads recursively, stripping any HTML and `<script>` tags from string inputs before they reach schema validation or query stages.
- **JSON-Only Response Boundaries**: All API endpoints return structured `application/json` data, not HTML/XML. Modern browsers interpret JSON responses strictly as text data, preventing scripts from executing automatically.
- **Strict Input Validation**: Fields containing critical user information (names, emails, mobiles) are validated for specific character sets, blocking arbitrary script block payloads (e.g., `<script>...</script>`).
- **Client escaping recommendation**: While the backend serves data securely as JSON, frontends should use secure text rendering (e.g. using `{{ }}` in Vue, `{ }` in React, or standard text bindings in native iOS/Android apps) to escape outputs automatically.

---

## 4. API Security (CORS & Rate Limiting)

To protect the server from automated abuse, Denial of Service (DoS) attacks, and unauthorized domain resource requests, the API implements strict rate-limiting and cross-origin resource policies.

### A. Rate Limiting (`rateLimit.middleware.js`)
Rate limiting prevents clients from abusing the API endpoints by restricting the maximum number of requests a single IP address can make in a specified window of time:
- **Global Rate Limiter**: Configured globally in `server.js`. Limits all incoming requests to a maximum of **100 requests per 15 minutes** per IP.
- **Authentication Rate Limiter**: Mounted strictly on `/api/v1/auth/` routes. Limits sensitive authentication actions (like generating OTPs, verifying OTPs, registering, or logging in) to a maximum of **10 auth requests per 15 minutes** per IP.
- **Test Mode Bypass**: Rate limiters are automatically bypassed when `NODE_ENV === 'test'` to allow test runners to execute sequentially without causing `429 Too Many Requests` false-positives.

### B. CORS (Cross-Origin Resource Sharing)
- Mounted globally via the `cors` Express package.
- Allows resource requests from authorized origins (customizable via `process.env.CORS_ORIGIN`, defaulting to `*` for open development API access).
- Sets permitted HTTP request methods: `GET, POST, PUT, DELETE, OPTIONS` and standard custom headers.

---

## 5. Secrets Management

Keeping application secrets (API keys, database credentials, mailing passwords) out of source control is crucial for environment security:

### Local Development
- Secrets are stored inside a local, git-ignored `.env` file.
- The `dotenv` package loads these values into memory (`process.env`) on server boot.
- A `.env.example` file is tracked in git as a template without exposing actual credentials.

### Docker & Containerization
- **Docker Compose**: Production or staging environments pass environment variables dynamically or reference local configurations:
  ```yaml
  environment:
    - DB_PASSWORD=${DB_PASSWORD}
  ```

### Kubernetes (Production Orchestration)
- Sensitive credentials (e.g., `DB_PASSWORD`, `JWT_SECRET`, `TWILIO_TOKEN`) are stored in Kubernetes **Secrets** resource objects (`k8s/secret.yaml`).
- ConfigMaps store non-sensitive environment values (like `DB_HOST` and `NODE_ENV`).
- These secrets are mounted directly as environment variables within the application pods at run-time:
  ```yaml
  envFrom:
    - configMapRef:
        name: mandal-config
    - secretRef:
        name: mandal-secrets
  ```

---

## 6. Database Security (Access Control, Query Security, Backups)

To safeguard critical transactional financial tables, the system maintains security at the database connection, query execution, and data recovery levels.

### A. Access Control
- **Environment Isolation**: Database credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`) are never hardcoded and are loaded strictly from the environment context.
- **Least Privilege Principle**: In production environments, database users are restricted to standard DML commands (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) for security. DDL permissions are reserved strictly for migrations during deployments.

### B. Query Security
- **Sequelize ORM Parameterization**: By avoiding raw queries and using Sequelize syntax (e.g. `User.findOne()`), all queries are parameterized automatically by the `mysql2` driver. This prevents attackers from escaping queries and executing arbitrary injected scripts.
- **Prevention of Raw SQL Execution**: The application avoids passing direct string concatenations or custom variables into raw SQL executions, assuring that query structures are static and input-bound.

### C. Database Backups
- **Automated Backup Script**: An automated script is provided under `scripts/backup-db.sh`.
- **Functionality**:
  - Automatically loads database credentials (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) from the local `.env` configuration.
  - Generates a timestamped SQL dump (`.sql` format) using `mysqldump`.
  - Automatically compresses the SQL dump using `gzip` to save storage space.
- **Scheduling**: Can be automated in production environments via a Linux cron job:
  ```bash
  0 2 * * * /bin/bash /path/to/project/scripts/backup-db.sh >> /var/log/db_backup.log 2>&1
  ```
  *(Schedules a compressed backup daily at 2:00 AM).*
