# REST API Documentation

Base URL is the backend origin (local default `http://localhost:3001`). Bearer authentication uses `Authorization: Bearer <JWT>`.

## Authentication

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | None | Creates a PARTICIPANT; body: `name`, `email`, `phone`, `password`. |
| POST | `/login` | None | Returns `{ token, user }`; body: `email`, `password`. |
| GET | `/health` | None | Database/server health response. |

## Users (`/user`)

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| GET | `/user/profile` | Any authenticated | Current profile. |
| PUT | `/user/profile` | Any authenticated | Updates name/email/phone; optional password change. |
| GET | `/user` | ADMIN | List users without passwords. |
| GET | `/user/:id` | ADMIN | Get one user without password. |
| PATCH | `/user/:id/role` | ADMIN | Set `ORGANIZER` or `PARTICIPANT`; admin self-role change is blocked. |
| DELETE | `/user/:id` | ADMIN | Delete another user and remove their bookings. |

## Events

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| GET | `/events` | Public | List events. |
| GET | `/events/:id` | Authenticated | Event details. |
| POST | `/events` | ADMIN, ORGANIZER | Create; backend assigns `createdBy` and `organizerId` from JWT. |
| PUT | `/events/:id` | ADMIN or owning ORGANIZER | Update event. Ownership is checked server-side. |
| DELETE | `/events/:id` | ADMIN or owning ORGANIZER | Delete event. |

## Registration and bookings

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| POST | `/events/:id/register` or `/events/:id/book` | PARTICIPANT | Register once, subject to capacity/deadline. Duplicate returns 409. |
| DELETE | `/events/:id/register` or `/events/:id/book` | PARTICIPANT | Cancel the authenticated participant's registration. |
| GET | `/my-registrations` or `/user/booked-events` | PARTICIPANT | List own registered events. |
| GET | `/registrations` | ADMIN, ORGANIZER | Admin sees all event registrations; organizer sees owned events only. |

## Dashboards and feedback

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| GET | `/admin/dashboard` | ADMIN | User, event, registration totals plus recent users/events. |
| GET | `/organizer/dashboard` | ORGANIZER | Owned event totals, registration totals, and upcoming events. |
| POST | `/feedback` | Public | Stores `name`, `email`, and `message`. |

Errors use 400 for validation, 401 for missing/invalid authentication, 403 for forbidden roles/ownership, 404 for missing resources, 409 for duplicate registration, and 500 for safe server errors.
