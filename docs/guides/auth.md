# Authentication & Authorization Guide

This document outlines the security architecture implemented in the Mandal backend, covering password security, stateless JWT token management, Role-Based Access Control (RBAC), Multi-Factor Authentication (MFA), and session tracking/revocation.

---

## 1. Password Security

- **Hashing Algorithm**: Passwords are never stored in plain text. The application uses `bcrypt` with a work factor of `10` rounds to generate secure hashes (`passwordHash`) before persisting to MySQL.
- **Workflow Protection**:
  - Setting a password requires verification of a short-lived `otpToken`.
  - Passwords and confirmation inputs are validated at the API route level to ensure matching payloads.

---

## 2. JWT (JSON Web Tokens)

Stateless authentication is achieved using JWTs signed using a cryptographically secure `JWT_SECRET` key loaded from environment variables.

### Access Token
- **Lifetime**: 1 hour (`1h`).
- **Payload Structure**:
  ```json
  {
    "id": "user-uuid",
    "mobile": "7621892194",
    "roles": ["MANDAL_OWNER"]
  }
  ```
- **Authentication Flow**:
  - The client attaches the access token in the `Authorization: Bearer <token>` HTTP header.
  - The `auth.middleware.js` decodes and verifies the token.
  - The middleware loads the user's profile and roles (caching lookups in Redis to eliminate redundant database calls on subsequent requests).

---

## 3. RBAC (Role-Based Access Control)

Mandal enforces authorization constraints at two hierarchical levels:

### A. System-Level Roles
Users possess global roles mapping to their actions across the platform. These roles are retrieved during authentication and stored in `req.user.roles`:
- **SUPER_ADMIN**: Absolute control over the system, platforms, and mandals.
- **MANDAL_OWNER**: Creator/Owner of a Mandal. Can manage settings, helper roles, and financial terms.
- **HELPER**: Operator assigned to assist in registering contributions or managing members.
- **MEMBER**: Standard user registered inside a Mandal.

### B. Mandal-Level Roles
Middlewares (such as `role.middleware.js`) dynamically restrict endpoints based on the caller's relationship to the specific Mandal:
- **`roleMiddleware('admin')`**: Restricts actions (e.g. adding members, deleting loans) to only authorized administrators or owners of that specific Mandal.
- **Member Checks**: Validates that a user is registered under the target `mandalId` before serving financial ledgers.

---

## 4. Multi-Factor Authentication (MFA) & OTP

The application uses SMS-based verification as a Multi-Factor Authentication security barrier:

### OTP Verification Flow:
1. **Request Verification**: Endpoint `/api/v1/auth/send-otp` generates a secure 6-digit random code.
2. **Secure Database Log**: The code is hashed (`bcrypt`) and saved in `UserOtp` with:
   - A short lifetime (5 minutes).
   - An index linking it to the request ID (`otpRef`).
   - A brute-force limit counter (restricted to maximum 5 attempts).
3. **Dispatch**: Dispatched via Twilio SMS provider.
4. **Validation**: Endpoint `/api/v1/auth/verify-otp` validates the input code against the hash. Upon success, it issues a 10-minute short-lived `otpToken`.
5. **Flow Completion**: The user completes registration or sets a password using the `otpToken` as proof of phone ownership.

---

## 5. Session Management & Token Revocation

Stateless JWT tokens are paired with session records to support user tracking, concurrent logins, and absolute revocation:

### Session Lifecycle:
1. **Login**: Hitting `/api/v1/auth/login` generates:
   - An **Access Token** (expires in 1 hour).
   - A **Refresh Token** (expires in 30 days, contains a unique `sessionId`).
2. **Persistence**: The hash of the refresh token is stored in the `user_sessions` database table linked to the client's `userId`.
3. **Revocation (Logout)**: Hitting `/api/v1/auth/logout` invalidates the session by setting the `revokedAt` column to the current timestamp. Any subsequent attempt to use the refresh token is blocked.
