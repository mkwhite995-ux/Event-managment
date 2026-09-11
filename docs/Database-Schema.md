# Database Schema

## User (`User`)

| Field | Type | Required | Default/values | Reference | Purpose |
|---|---|---:|---|---|---|
| `_id` | ObjectId | Yes | MongoDB default | Primary key | User identifier |
| `name` | String | Yes | — | — | Display name |
| `email` | String | Yes | —, unique, lowercase | — | Login email |
| `phone` | String | Yes | — | — | Contact number |
| `password` | String | Yes | —, minimum 6 chars | — | Bcrypt password hash |
| `role` | String | Yes | `PARTICIPANT` | `ADMIN`, `ORGANIZER`, `PARTICIPANT` | RBAC role |
| `createdAt` | Date | No | Date.now / timestamps | — | Creation time |
| `lastLogin` | Date | No | — | — | Last successful login |
| `resetPasswordToken` | String | No | — | — | Reserved reset field |
| `resetPasswordExpire` | Date | No | — | — | Reserved reset field |

## Event (`Event`)

| Field | Type | Required | Default/values | Reference | Purpose |
|---|---|---:|---|---|---|
| `_id` | ObjectId | Yes | MongoDB default | Primary key | Event identifier |
| `title` | String | Yes | — | — | Event title |
| `description` | String | Yes | — | — | Event description |
| `date` | Date | Yes | — | — | Event date |
| `registrationDeadline` | Date | No | — | — | Registration cutoff |
| `time` | String | Yes | HH:mm validation | — | Event time |
| `venue` | String | Yes | — | — | Location |
| `category` | String | Yes | `conference`, `workshop`, `seminar`, `party` | — | Category |
| `capacity` | Number | Yes | minimum 1 | — | Maximum participants |
| `price` | Number | Yes | 0, minimum 0 | — | Event price |
| `image` | String | No | — | — | Optional image/data URL |
| `createdBy` | ObjectId | Yes | — | User | Creator identity |
| `organizerId` | ObjectId | Yes | — | User | Organizer ownership |
| `bookedBy` | ObjectId[] | No | [] | User[] | Legacy/current booking list |
| `status` | String | No | `upcoming` | `upcoming`, `ongoing`, `completed`, `cancelled` | Event status |

## Registration (`Registration`)

| Field | Type | Required | Default/values | Reference | Purpose |
|---|---|---:|---|---|---|
| `_id` | ObjectId | Yes | MongoDB default | Primary key | Registration identifier |
| `userId` | ObjectId | Yes | — | User | Participant |
| `eventId` | ObjectId | Yes | — | Event | Registered event |
| `registrationDate` | Date | No | Date.now | — | Registration time |
| `createdAt` / `updatedAt` | Date | No | Timestamps | — | Audit timestamps |

Compound unique index: `{ userId: 1, eventId: 1 }`.

## Feedback (`feedback`)

Fields are `name` (String), `email` (String), and `message` (String). None are required and there are no entity references. The API writes feedback documents but the schema is not connected to users/events.
